"use client";

// ui/screens/GenericListingComponent.tsx
import { useEffect, useState } from "react";
import HomeHeadingSection from "@/lib/ui/useable-components/home-heading-section";
import CuisinesSection from "@/lib/ui/useable-components/cuisines-section";
import MainSection from "@/lib/ui/useable-components/restaurant-main-section";
import FilterModal from "@/lib/ui/useable-components/filter-modal";
import { useLocationContext } from "@/lib/context/Location/Location.context";
import { filterRestaurants } from "@/lib/utils/methods";
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

  useEffect(() => {
    if (!mainData || !cuisineDataFromHook) return;

    setcuisineData(cuisineDataFromHook);

    const hasActiveFilters =
      filters.cuisines.length > 0 ||
      filters.rating.length > 0 ||
      sortBy !== "Recommended";

    if (hasActiveFilters) {
      setrestaurantData(
        filterRestaurants(
          mainData,
          filters,
          sortBy,
          cuisineDataFromHook,
          userLatitude,
          userLongitude
        )
      );
      return;
    }

    setrestaurantData(mainData);
  }, [
    mainData,
    cuisineDataFromHook,
    filters,
    sortBy,
    userLatitude,
    userLongitude,
  ]);

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
      filterRestaurants(
        mainData ?? [],
        tempFilters,
        tempSortBy,
        cuisineData,
        userLatitude,
        userLongitude
      )
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
