#!/usr/bin/env node
/**
 * Minimal local GraphQL stub for Enatega frontend demos when the hosted API
 * is unreachable (e.g. restricted cloud egress). Not a substitute for the
 * proprietary backend — see DEMO_SETUP.md.
 *
 * Usage: node scripts/demo-graphql-stub.mjs
 * Listens on http://127.0.0.1:8001/graphql
 */
import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.DEMO_STUB_PORT || 8001);
// Relative paths avoid next/image "hostname not configured" crashes on localhost.
const IMG = "/assets/images/png/restaurantBanner.webp";
const LOGO = "/assets/images/png/logo.png";
const FOOD_IMG = "/assets/images/png/freshGroceries.jpg";

const openingTimes = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
  (day) => ({
    day,
    times: [{ startTime: ["00", "00"], endTime: ["23", "59"] }],
  }),
);

// Ensure card/components never see undefined arrays
function withSafeRestaurant(r) {
  return {
    ...r,
    cuisines: Array.isArray(r.cuisines) ? r.cuisines : [],
    openingTimes: Array.isArray(r.openingTimes) ? r.openingTimes : openingTimes,
  };
}

function restaurantPreview(overrides = {}, typename = "RestaurantPreview") {
  return {
    __typename: typename,
    _id: overrides._id || randomUUID().slice(0, 8),
    name: overrides.name || "Demo Kitchen",
    image: IMG,
    logo: LOGO,
    slug: overrides.slug || "demo-kitchen",
    shopType: overrides.shopType || "restaurant",
    minimumOrder: 5,
    deliveryTime: 25,
    location: { coordinates: [-0.1276, 51.5072] },
    reviewAverage: 4.6,
    cuisines: overrides.cuisines || ["Burgers", "American"],
    openingTimes,
    isAvailable: true,
    isActive: true,
    address: "221B Demo Street, London",
    ...overrides,
  };
}

function asCarousel(list) {
  return list.map((r) => ({ ...r, __typename: "RestaurantCarouselPreview" }));
}

const restaurants = [
  restaurantPreview({
    _id: "rest-burger",
    name: "Demo Burgers",
    slug: "demo-burgers",
    shopType: "restaurant",
    cuisines: ["Burgers", "American"],
  }),
  restaurantPreview({
    _id: "rest-pizza",
    name: "Demo Pizza Co",
    slug: "demo-pizza",
    shopType: "restaurant",
    cuisines: ["Pizza", "Italian"],
  }),
  restaurantPreview({
    _id: "rest-sushi",
    name: "Demo Sushi Bar",
    slug: "demo-sushi",
    shopType: "restaurant",
    cuisines: ["Sushi", "Japanese"],
  }),
  restaurantPreview({
    _id: "rest-tacos",
    name: "Demo Taco House",
    slug: "demo-tacos",
    shopType: "restaurant",
    cuisines: ["Mexican"],
  }),
  restaurantPreview({
    _id: "rest-curry",
    name: "Demo Curry Club",
    slug: "demo-curry",
    shopType: "restaurant",
    cuisines: ["Indian"],
  }),
  restaurantPreview({
    _id: "store-fresh",
    name: "Demo Fresh Mart",
    slug: "demo-fresh-mart",
    shopType: "grocery",
    cuisines: ["Grocery"],
  }),
  restaurantPreview({
    _id: "store-organic",
    name: "Demo Organic Pantry",
    slug: "demo-organic",
    shopType: "grocery",
    cuisines: ["Grocery"],
  }),
  restaurantPreview({
    _id: "store-daily",
    name: "Demo Daily Market",
    slug: "demo-daily",
    shopType: "grocery",
    cuisines: ["Grocery"],
  }),
];

function fullRestaurant(idOrSlug) {
  const base =
    restaurants.find((r) => r._id === idOrSlug || r.slug === idOrSlug) ||
    restaurants[0];
  return {
    ...base,
    __typename: "Restaurant",
    orderId: 1001,
    orderPrefix: "DEMO",
    username: "demo-store",
    phone: "+10000000000",
    tax: 0,
    stripeDetailsSubmitted: true,
    rating: 4.6,
    reviewData: { total: 12, ratings: 4.6, reviews: [] },
    categories: [
      {
        _id: "cat-mains",
        title: "Mains",
        foods: [
          {
            _id: "food-classic",
            title: "Classic Demo Burger",
            image: FOOD_IMG,
            description: "A tasty demo burger for presenter walkthroughs.",
            isOutOfStock: false,
            subCategory: "",
            variations: [
              {
                _id: "var-regular",
                title: "Regular",
                price: 9.99,
                discounted: 0,
                addons: [],
                isOutOfStock: false,
              },
            ],
          },
          {
            _id: "food-fries",
            title: "Demo Fries",
            image: FOOD_IMG,
            description: "Crispy demo side.",
            isOutOfStock: false,
            subCategory: "",
            variations: [
              {
                _id: "var-fries",
                title: "Regular",
                price: 3.5,
                discounted: 0,
                addons: [],
                isOutOfStock: false,
              },
            ],
          },
        ],
      },
    ],
    options: [],
    addons: [],
    zone: { _id: "zone-1", title: "Demo Zone", tax: 0 },
  };
}

function rootField(query = "") {
  const cleaned = String(query)
    .replace(/#.*/g, "")
    .replace(/fragment[\s\S]*?(?=query|mutation|subscription|$)/gi, "");
  const m = cleaned.match(
    /(?:query|mutation|subscription)\s+\w*[^{]*\{\s*(\w+)/i,
  );
  if (m) return m[1];
  const m2 = cleaned.match(/\{\s*(\w+)/);
  return m2 ? m2[1] : "";
}

function handle(body) {
  const op = body.operationName || "";
  const field = rootField(body.query || "");
  const key = (op || field || "").toLowerCase();
  const vars = body.variables || {};

  const metrics = {
    excellence: "x",
    topgun: "x",
    experience: "demo-metrics-token",
    skydiver: "x",
    rider: "x",
    haha: "x",
    hehe: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    huhu: "x",
    yoyo: "x",
    turu: "x",
  };

  if (key.includes("metrics") || field === "metricsGeneral") {
    return { data: { metricsGeneral: metrics } };
  }

  if (key.includes("configuration") || field === "configuration") {
    return {
      data: {
        configuration: {
          _id: "cfg-demo",
          currency: "USD",
          currencySymbol: "$",
          deliveryRate: 2,
          twilioEnabled: false,
          webClientID: "",
          webAmplitudeApiKey: "",
          googleMapLibraries: "places,drawing,geometry",
          googleColor: "#94e469",
          webSentryUrl: "",
          publishableKey: "",
          clientId: "",
          skipEmailVerification: true,
          skipMobileVerification: true,
          costType: "fixed",
          firebaseKey: "",
          authDomain: "",
          projectId: "",
          storageBucket: "",
          msgSenderId: "",
          appId: "",
          password: "",
        },
      },
    };
  }

  if (field === "getCountries" || key.includes("getcountries")) {
    return {
      data: {
        getCountries: [
          { _id: "country-uk", name: "United Kingdom", flag: "🇬🇧" },
          { _id: "country-us", name: "United States", flag: "🇺🇸" },
        ],
      },
    };
  }

  if (field === "getCitiesByCountry" || key.includes("getciti")) {
    return {
      data: {
        getCitiesByCountry: {
          id: vars.id || "country-uk",
          name: "United Kingdom",
          cities: [
            {
              id: "city-london",
              name: "London",
              latitude: 51.5072,
              longitude: -0.1276,
            },
            {
              id: "city-manchester",
              name: "Manchester",
              latitude: 53.4808,
              longitude: -2.2426,
            },
          ],
        },
      },
    };
  }

  const safeRestaurants = restaurants.map(withSafeRestaurant);

  if (
    field === "nearByRestaurantsPreview" ||
    (key.includes("restaurants") && !key.includes("restaurantby"))
  ) {
    if (field === "nearByRestaurantsPreview" || op === "Restaurants") {
      return {
        data: { nearByRestaurantsPreview: { restaurants: safeRestaurants } },
      };
    }
  }

  if (
    field === "mostOrderedRestaurantsPreview" ||
    key.includes("mostordered")
  ) {
    return {
      data: { mostOrderedRestaurantsPreview: asCarousel(safeRestaurants) },
    };
  }

  if (
    field === "recentOrderRestaurantsPreview" ||
    key.includes("recentorder")
  ) {
    return {
      data: {
        recentOrderRestaurantsPreview: asCarousel(safeRestaurants.slice(0, 2)),
      },
    };
  }

  if (field === "topRatedVendorsPreview" || key.includes("toprated")) {
    return {
      data: { topRatedVendorsPreview: asCarousel(safeRestaurants) },
    };
  }

  if (field === "nearByRestaurantsCuisines" || key.includes("cuisine")) {
    return {
      data: {
        nearByRestaurantsCuisines: [
          {
            _id: "cui-burgers",
            name: "Burgers",
            description: "Demo cuisine",
            image: FOOD_IMG,
            shopType: "restaurant",
          },
          {
            _id: "cui-grocery",
            name: "Grocery",
            description: "Demo grocery",
            image: FOOD_IMG,
            shopType: "grocery",
          },
        ],
      },
    };
  }

  if (field === "banners" || key.includes("banner")) {
    return {
      data: {
        banners: [
          {
            _id: "ban-1",
            title: "Demo Banner",
            description: "Local stub banner",
            file: IMG,
            action: "none",
            screen: "NONE",
            parameters: "",
            slug: "",
            shopType: "restaurant",
          },
        ],
      },
    };
  }

  if (field === "fetchAllShopTypes" || key.includes("shoptype")) {
    return {
      data: {
        fetchAllShopTypes: {
          data: [
            { _id: "st-1", name: "Restaurant", image: IMG, slug: "restaurant" },
            { _id: "st-2", name: "Grocery", image: IMG, slug: "grocery" },
          ],
        },
      },
    };
  }

  if (field === "restaurant" || key.includes("restaurantby")) {
    return {
      data: {
        restaurant: fullRestaurant(vars.id || vars.slug),
      },
    };
  }

  if (field === "emailExist" || key.includes("emailexist")) {
    const email = vars.email || "";
    return {
      data: {
        emailExist: email.toLowerCase() === "demo-customer@enatega.com",
      },
    };
  }

  if (field === "login" || op === "Login") {
    const email = (vars.email || "").toLowerCase();
    const password = vars.password || "";
    if (email === "demo-customer@enatega.com" && password === "123123") {
      return {
        data: {
          login: {
            userId: "user-demo",
            token: "demo-customer-token",
            tokenExpiration: 86400,
            name: "Demo Customer",
            phone: "",
            phoneIsVerified: true,
            email,
            emailIsVerified: true,
            picture: "",
            addresses: [
              {
                location: { coordinates: [-0.1276, 51.5072] },
                deliveryAddress: "London Demo Address",
              },
            ],
            isNewUser: false,
            userTypeId: "customer",
            isActive: true,
          },
        },
      };
    }
    return {
      errors: [{ message: "Invalid email or password", extensions: { code: "UNAUTHENTICATED" } }],
    };
  }

  const adminUser = {
    userId: "admin-demo",
    token: "demo-admin-token",
    tokenExpiration: 86400,
    refreshToken: "demo-admin-refresh",
    refreshTokenExpiration: 86400 * 7,
    email: vars.email || "admin@demo.local",
    userType: "ADMIN",
    restaurants: restaurants.map((r) => ({
      _id: r._id,
      orderId: 1,
      name: r.name,
      image: r.image,
      address: r.address,
    })),
    permissions: ["admin"],
    userTypeId: "ADMIN",
    image: LOGO,
    name: "Demo Admin",
    isActive: true,
  };

  if (field === "ownerLogin" || key.includes("ownerlogin")) {
    return { data: { ownerLogin: adminUser } };
  }

  if (field === "ownerSession" || key.includes("ownersession")) {
    return { data: { ownerSession: adminUser } };
  }

  if (field === "zones" || key.includes("zones")) {
    return {
      data: {
        zones: [
          {
            _id: "zone-1",
            title: "Demo Zone",
            description: "Local demo delivery zone",
            tax: 0,
            isActive: true,
            location: {
              coordinates: [
                [
                  [-0.2, 51.4],
                  [-0.05, 51.4],
                  [-0.05, 51.6],
                  [-0.2, 51.6],
                  [-0.2, 51.4],
                ],
              ],
            },
          },
        ],
      },
    };
  }

  if (field === "popularItems" || key.includes("popularitems")) {
    return {
      data: {
        popularItems: [
          {
            id: "food-classic",
            name: "Classic Demo Burger",
            image: FOOD_IMG,
            price: 9.99,
          },
        ],
      },
    };
  }

  if (field === "reviewsByRestaurant" || key.includes("reviews")) {
    return {
      data: {
        reviewsByRestaurant: {
          reviews: [],
          ratings: 4.6,
          total: 0,
        },
      },
    };
  }

  if (field === "hasOwnerPermission" || key.includes("hasownerpermission")) {
    return { data: { hasOwnerPermission: true } };
  }

  if (field === "profile" || key.includes("profile") || key.includes("user")) {
    return {
      data: {
        profile: {
          _id: "user-demo",
          name: "Demo Customer",
          email: "demo-customer@enatega.com",
          phone: "",
          phoneIsVerified: true,
          emailIsVerified: true,
          isActive: true,
          addresses: [],
          favourite: [],
        },
      },
    };
  }

  // Soft-success fallback so unknown queries don't crash the UI hard
  console.warn("[demo-stub] unhandled field/op:", { field, op });
  return { data: { [field || "ok"]: null } };
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, nonce, bop-auth, userId, isAuth, X-Client-Type",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, stub: true }));
    return;
  }

  if (req.method === "POST" && (req.url === "/graphql" || req.url === "/")) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    let body = {};
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ errors: [{ message: "Invalid JSON" }] }));
      return;
    }
    const result = handle(body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[demo-stub] GraphQL listening on http://127.0.0.1:${PORT}/graphql`);
});
