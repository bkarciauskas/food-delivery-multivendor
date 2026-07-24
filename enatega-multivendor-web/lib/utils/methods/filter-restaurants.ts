import { getDistanceFromLatLonInKm } from "@/lib/utils/methods/helpers";
import { ICuisinesData, IRestaurant } from "@/lib/utils/interfaces";

export interface RestaurantFilters {
  cuisines: string[];
  rating: string[];
}

const normalizeCuisine = (value: string) =>
  value.toString().normalize("NFKC").toLocaleLowerCase();

export function filterRestaurants(
  restaurants: IRestaurant[],
  filters: RestaurantFilters,
  sortBy: string,
  cuisineCatalog: ICuisinesData[],
  userLatitude: number,
  userLongitude: number
): IRestaurant[] {
  let filtered = [...restaurants];

  if (filters.cuisines.length > 0) {
    const selectedCuisineNames = new Set(
      cuisineCatalog
        .filter((cuisine) => filters.cuisines.includes(cuisine._id))
        .map((cuisine) => normalizeCuisine(cuisine.name))
    );

    filtered = filtered.filter((item) =>
      item.cuisines?.some((cuisine) =>
        selectedCuisineNames.has(normalizeCuisine(cuisine))
      )
    );
  }

  if (filters.rating.length > 0) {
    filtered = filtered.filter((item) =>
      filters.rating.some((rating) => {
        const num = Number(rating);
        const lower = num;
        const upper = num === 4 ? 5 : num + 0.99;
        return item.reviewAverage >= lower && item.reviewAverage <= upper;
      })
    );
  }

  if (sortBy === "Distance") {
    filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (sortBy === "Delivery Time") {
    filtered.sort((a, b) => {
      const [lonA, latA] = a.location.coordinates;
      const [lonB, latB] = b.location.coordinates;
      return (
        getDistanceFromLatLonInKm(userLatitude, userLongitude, latA, lonA) -
        getDistanceFromLatLonInKm(userLatitude, userLongitude, latB, lonB)
      );
    });
  } else if (sortBy === "Rating") {
    filtered.sort((a, b) => b.reviewAverage - a.reviewAverage);
  }

  return filtered;
}
