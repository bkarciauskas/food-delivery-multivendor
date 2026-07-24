"use client";

// ui/screens/GenericListingComponent.tsx
import { useEffect, useState } from "react";
import HomeHeadingSection from "@/lib/ui/useable-components/home-heading-section";
import CuisinesSection from "@/lib/ui/useable-components/cuisines-section";
import MainSection from "@/lib/ui/useable-components/restaurant-main-section";
import FilterModal from "@/lib/ui/useable-components/filter-modal";
import { useLocationContext } from "@/lib/context/Location/Location.context";
import { getDistanceFromLatLonInKm } from "@/lib/utils/methods";
import { ICuisinesData, IRestaurant } from "@/lib/utils/interfaces";

interface GenericListingProps {
  headingTitle: string;
  cuisineSectionTitle: string;
  mainSectionTitle: string;
  mainData: IRestaurant[] | undefined;
  queryData: IRestaurant[] | undefined;
  cuisineDataFromHook: ICuisinesData[];
  loading: boolean;
  cuisinesloading: boolean;
  error: boolean;
  hasMore?: boolean;
}

export default function GenericListingComponent({
  headingTitle,
  cuisineSectionTitle,
  mainSectionTitle, 
  mainData,
  cuisineDataFromHook,
  loading,
  cuisinesloading,
  error,
  hasMore,
  queryData
  
}: GenericListingProps) {
  const [cuisineData, setcuisineData] = useState<ICuisinesData[]>([]);
  const [restaurantData, setrestaurantData] = useState<IRestaurant[]>([]);
  const [showDialog, setshowDialog] = useState(false);
  const [filters, setFilters] = useState<{
    cuisines: string[];
    rating: string[];
  }>({ cuisines: [], rating: [] });
  const [tempFilters, setTempFilters] = useState<{
    cuisines: string[];
    rating: string[];
  }>({ cuisines: [], rating: [] });
  const [sortBy, setSortBy] = useState("Recommended");
  const [tempSortBy, setTempSortBy] = useState("Recommended");

  const { location } = useLocationContext();
  const userLatitude = Number(location?.latitude || "0");
  const userLongitude = Number(location?.longitude || "0");

  const normalizeCuisine = (value: string) =>
    value?.toString().normalize("NFKC").toLocaleLowerCase() ?? "";

  const applyFiltersAndSort = (
    data: IRestaurant[],
    activeFilters: { cuisines: string[]; rating: string[] },
    activeSortBy: string
  ) => {
    let filtered = [...data];

    if (activeFilters.cuisines.length > 0) {
      const normalizedSelected = activeFilters.cuisines.map(normalizeCuisine);
      filtered = filtered.filter((item) =>
        item.cuisines.some((cuisine) =>
          normalizedSelected.includes(normalizeCuisine(cuisine))
        )
      );
    }

    if (activeFilters.rating.length > 0) {
      filtered = filtered.filter((item) =>
        activeFilters.rating.some((rating) => {
          const num = Number(rating);
          const lower = num;
          const upper = num === 4 ? 5 : num + 0.99;
          return item.reviewAverage >= lower && item.reviewAverage <= upper;
        })
      );
    }

    if (activeSortBy === "Distance") {
      filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
    } else if (activeSortBy === "Delivery Time") {
      filtered.sort((a, b) => {
        const [lonA, latA] = a.location.coordinates;
        const [lonB, latB] = b.location.coordinates;
        return (
          getDistanceFromLatLonInKm(userLatitude, userLongitude, latA, lonA) -
          getDistanceFromLatLonInKm(userLatitude, userLongitude, latB, lonB)
        );
      });
    } else if (activeSortBy === "Rating") {
      filtered.sort((a, b) => b.reviewAverage - a.reviewAverage);
    }

    return filtered;
  };

  useEffect(() => {
    if (mainData && cuisineDataFromHook) {
      setcuisineData(cuisineDataFromHook);
      const hasActiveFilters =
        filters.cuisines.length > 0 ||
        filters.rating.length > 0 ||
        sortBy !== "Recommended";
      setrestaurantData(
        hasActiveFilters ?
          applyFiltersAndSort(mainData, filters, sortBy)
        : mainData
      );
    }
  }, [mainData, cuisineDataFromHook, filters, sortBy]);

  useEffect(() => {
    if (showDialog) {
      setTempSortBy(sortBy);
      setTempFilters(filters);
    }
  }, [showDialog]);

  const handleShowModal = () => setshowDialog(true);
  const handleCloseModal = () => setshowDialog(false);

  const handleFilterApply = () => {
    setSortBy(tempSortBy);
    setFilters(tempFilters);
    setrestaurantData(
      applyFiltersAndSort(mainData ?? [], tempFilters, tempSortBy)
    );
    setshowDialog(false);
  };

  const clearFilters = () => {
    setFilters({ cuisines: [], rating: [] });
    setTempFilters({ cuisines: [], rating: [] });
    setSortBy("Recommended");
    setTempSortBy("Recommended");
    setrestaurantData(mainData ?? []);
    setshowDialog(false);
  };

  return (
    <>
      <HomeHeadingSection
        title={headingTitle}
        onPress={handleShowModal}
        appliedFilters={filters.cuisines.length + filters.rating.length}
        sortByTitle={sortBy}
      />
      {filters.cuisines.length === 0 && filters.rating.length === 0 && (
        <CuisinesSection
          title={cuisineSectionTitle}
          data={cuisineData}
          loading={cuisinesloading}
          error={error}
        />
      )}
      <MainSection
      queryData={queryData}
        title={mainSectionTitle}
        data={restaurantData}
        loading={loading}
        error={error}
        hasMore={hasMore} // ✅ pass down for infinite scroll message
      />
      <FilterModal
        visible={showDialog}
        onClose={handleCloseModal}
        cuisineData={cuisineData}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        tempSortBy={tempSortBy}
        setTempSortBy={setTempSortBy}
        handleFilterApply={handleFilterApply}
        clearFilters={clearFilters}
      />
    </>
  );
}
