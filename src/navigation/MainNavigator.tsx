import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { BookDetailScreen } from "@/features/home/screens/BookDetailScreen";
import { BookListScreen } from "@/features/home/screens/BookListScreen";
import { AuthorsListScreen } from "@/features/home/screens/AuthorsListScreen";
import { CartScreen } from "@/features/cart/screens/CartScreen";
import { CategoriesScreen } from "@/features/categories/screens/CategoriesScreen";
import { WishlistScreen } from "@/features/wishlist/screens/WishlistScreen";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";

export type HomeStackParamList = {
  HomeScreen: undefined;
  BookDetail: {
    book: {
      id: string;
      title: string;
      author: string;
      price: string;
      rating: string;
      bookCover?: string;
      coverUrl?: string;
      cover?: string;
      files?: Array<{ type: string; url: string } | unknown>;
      [key: string]: unknown;
    };
  };
  BookList: {
    title: string;
    filterType?: "featured" | "audiobook" | "recommended";
  };
  AuthorsList: {
    title: string;
  };
};

type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Explore: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CartStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="AuthorsList"
        component={AuthorsListScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

function CartNavigator() {
  return (
    <CartStack.Navigator>
      <CartStack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{ headerShown: false }}
      />
    </CartStack.Navigator>
  );
}

function ExploreNavigator() {
  return (
    <ExploreStack.Navigator>
      <ExploreStack.Screen
        name="CategoriesScreen"
        component={CategoriesScreen}
        options={{ headerShown: false }}
      />
    </ExploreStack.Navigator>
  );
}

function FavoritesNavigator() {
  return (
    <FavoritesStack.Navigator>
      <FavoritesStack.Screen
        name="WishlistScreen"
        component={WishlistScreen}
        options={{ headerShown: false }}
      />
    </FavoritesStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: "#FEFCF6",
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Cart":
              iconName = focused ? "cart" : "cart-outline";
              break;
            case "Explore":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "Favorites":
              iconName = focused ? "heart" : "heart-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "home-outline";
          }

          return (
            <Ionicons name={iconName} size={focused ? 24 : 22} color={color} />
          );
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Cart"
        component={CartNavigator}
        options={{ tabBarLabel: "Cart" }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreNavigator}
        options={{ tabBarLabel: "Category" }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesNavigator}
        options={{ tabBarLabel: "Wishlist" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}
