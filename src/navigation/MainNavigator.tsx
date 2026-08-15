import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomTabBar } from "./CustomTabBar";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { BookDetailScreen } from "@/features/home/screens/BookDetailScreen";
import { BookListScreen } from "@/features/home/screens/BookListScreen";
import { AuthorsListScreen } from "@/features/home/screens/AuthorsListScreen";
import { AuthorProfileScreen } from "@/features/home/screens/AuthorProfileScreen";
import { CartScreen } from "@/features/cart/screens/CartScreen";
import { CategoriesScreen } from "@/features/categories/screens/CategoriesScreen";
import { WishlistScreen } from "@/features/wishlist/screens/WishlistScreen";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { MyLibraryScreen } from "@/features/profile/screens/MyLibraryScreen";
import { AccountInfoScreen } from "@/features/profile/screens/AccountInfoScreen";
import { ChangePasswordScreen } from "@/features/profile/screens/ChangePasswordScreen";
import { HelpCenterScreen } from "@/features/profile/screens/HelpCenterScreen";
import { AboutAppScreen } from "@/features/profile/screens/AboutAppScreen";

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
  AuthorProfile: {
    authorId: string;
    authorName?: string;
    authorBio?: string;
    avatarUrl?: string;
  };
};

export type CartStackParamList = {
  CartScreen: undefined;
  AuthorsList: HomeStackParamList["AuthorsList"];
  AuthorProfile: HomeStackParamList["AuthorProfile"];
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  AccountInfoScreen: undefined;
  ChangePasswordScreen: undefined;
  MyLibraryScreen: undefined;
  HelpCenterScreen: undefined;
  AboutAppScreen: undefined;
  BookDetail: HomeStackParamList["BookDetail"];
  AuthorProfile: HomeStackParamList["AuthorProfile"];
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
const CartStack = createNativeStackNavigator<CartStackParamList>();
const ExploreStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

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
      <HomeStack.Screen
        name="AuthorProfile"
        component={AuthorProfileScreen}
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
      <CartStack.Screen
        name="AuthorsList"
        component={AuthorsListScreen}
        options={{ headerShown: false }}
      />
      <CartStack.Screen
        name="AuthorProfile"
        component={AuthorProfileScreen}
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
      <ProfileStack.Screen
        name="AccountInfoScreen"
        component={AccountInfoScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="MyLibraryScreen"
        component={MyLibraryScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="HelpCenterScreen"
        component={HelpCenterScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="AboutAppScreen"
        component={AboutAppScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="AuthorProfile"
        component={AuthorProfileScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
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
