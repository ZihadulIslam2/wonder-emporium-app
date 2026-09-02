import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/MainNavigator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi, libraryApi, LibraryItem, bookApi } from "@/api";
import { useWishlistStore, useReviewStore, useAuthStore } from "@/store";

type Props = NativeStackScreenProps<HomeStackParamList, "BookDetail">;

interface BookApiItem {
  id: string;
  title: string;
  author?: {
    username?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  formats?: Array<{
    id?: string;
    formatType?: string;
    listPrice?: number;
    sellingPrice?: number;
  }>;
  sellingPrice?: number;
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  files?: Array<{ type: string; url: string }>;
  audiobookAvailable?: boolean;
  description?: string;
  [key: string]: unknown;
}

const formats = ["eBook", "Paperback", "Audiobook", "Hardcover"];
const categories = ["Leadership", "Business", "Faith", "Personal Growth"];

const RATING_LABELS: Record<number, string> = {
  5: "★★★★★ Exceptional — Highly Recommended",
  4: "★★★★☆ Very Good — Enjoyed Reading",
  3: "★★★☆☆ Good — Worth Reading",
  2: "★★☆☆☆ Fair — Has Some Flaws",
  1: "★☆☆☆☆ Needs Improvement",
};

function BookCardSm({
  title,
  author,
  price,
  rating,
  coverUrl,
  onPress,
}: {
  title: string;
  author: string;
  price: string;
  rating: string;
  coverUrl?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.smBookCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.smBookCover}>
        {coverUrl ? (
          <ExpoImage
            source={{ uri: coverUrl }}
            style={styles.smCoverImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        ) : (
          <Ionicons name="headset" size={24} color={Colors.secondary} />
        )}
        <View style={styles.audioBadge}>
          <Ionicons name="headset" size={10} color={Colors.white} />
        </View>
      </View>
      <Text style={styles.smBookTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.smBookAuthor} numberOfLines={1}>
        {author}
      </Text>
      <View style={styles.smBookFooter}>
        <Text style={styles.smBookPrice}>{price}</Text>
        <View style={styles.smRatingBadge}>
          <Ionicons name="star" size={9} color={Colors.white} />
          <Text style={styles.smRatingText}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function BookDetailScreen({ route, navigation }: Props) {
  const { book } = route.params;
  const [selectedFormat, setSelectedFormat] = useState<string>("DIGITAL");

  const isWishlisted = useWishlistStore((state) => state.isInWishlist(book.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const [descExpanded, setDescExpanded] = useState(false);
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [book.id]);

  // Dynamic reviews integration
  const { initReviews, addReview, getReviewsForBook } = useReviewStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initReviews();
  }, [initReviews]);

  const reviews = getReviewsForBook(book.id);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "4.9";

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewerNameInput, setReviewerNameInput] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Dynamic audiobooks from API
  const { data: approvedBooksData, isLoading: isAudiobooksLoading } = useQuery({
    queryKey: ["books", "approved", "audiobooks"],
    queryFn: async () => {
      const res = await bookApi.getApproved({ limit: 12 });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const rawApproved: BookApiItem[] =
    approvedBooksData?.data?.books || approvedBooksData?.books || [];

  const popularAudiobooks = rawApproved
    .filter((b) => b.id !== book.id)
    .map((b) => {
      const author = b.author?.profile?.firstName
        ? `${b.author.profile.firstName} ${b.author.profile.lastName}`
        : b.author?.username || "Wonder Author";

      const audioFormat =
        b.formats?.find((f) => f.formatType === "AUDIOBOOK") || b.formats?.[0];

      const priceVal =
        audioFormat?.listPrice ?? audioFormat?.sellingPrice ?? b.sellingPrice;
      const price =
        priceVal !== undefined && priceVal !== null && Number(priceVal) > 0
          ? `$${Number(priceVal).toFixed(2)}`
          : "$14.99";

      const itemCover =
        b.bookCover ||
        b.coverUrl ||
        b.cover ||
        b.files?.find((f) => f.type === "COVER")?.url;

      return {
        id: b.id,
        title: b.title,
        author,
        price,
        rating: "4.9",
        bookCover: b.bookCover,
        coverUrl: itemCover,
        cover: b.cover,
        files: b.files,
        formats: b.formats,
        description: b.description,
      };
    });

  const handleViewAllAudiobooks = () => {
    navigation.navigate("BookList", {
      title: "Popular Audiobooks",
      filterType: "audiobook",
    });
  };

  const handleAudiobookPress = (audioItem: (typeof popularAudiobooks)[0]) => {
    (
      navigation as unknown as { push: (name: string, params: unknown) => void }
    ).push("BookDetail", { book: audioItem });
  };

  const coverUrl =
    book?.bookCover ||
    book?.coverUrl ||
    book?.cover ||
    (book?.files as Array<{ type?: string; url?: string }> | undefined)?.find(
      (f) => f.type === "COVER",
    )?.url;

  const formatsList = book?.formats as
    Array<{ id: string; formatType?: string; listPrice?: number }> | undefined;

  const selectedFormatObj =
    formatsList?.find(
      (f) => f.formatType?.toUpperCase() === selectedFormat.toUpperCase(),
    ) || formatsList?.[0];

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const formatId = selectedFormatObj?.id || formatsList?.[0]?.id;

      if (!formatId) {
        throw new Error("No available format for this book.");
      }
      return cartApi.addItem({
        bookId: book.id,
        formatId: formatId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      Alert.alert("Success", "Book added to cart!");
    },
    onError: (
      error: Error & {
        response?: { status?: number; data?: { message?: string } };
      },
    ) => {
      const message =
        error?.response?.data?.message ||
        (error?.response?.status === 401
          ? "Please log in to add items to your cart."
          : error.message || "Failed to add item to cart.");
      Alert.alert("Error", message);
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    addToCartMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        navigation.getParent()?.navigate("Cart");
      },
    });
  };

  const displayPrice = selectedFormatObj?.listPrice
    ? `$${selectedFormatObj.listPrice.toFixed(2)}`
    : book.price || "$24.99";

  const { data: libraryRes } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const res = await libraryApi.getLibrary();
      return res.data;
    },
  });

  const apiLibraryItems: LibraryItem[] = Array.isArray(libraryRes)
    ? libraryRes
    : (libraryRes as unknown as { data?: LibraryItem[] })?.data || [];

  const ownedLibraryItem = apiLibraryItems.find(
    (item) => item.book?.id === book.id,
  );
  const isOwned = Boolean(ownedLibraryItem);

  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to your Wonder Emporium account to write a review.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => navigation.getParent()?.navigate("Profile"),
          },
        ],
      );
      return;
    }

    if (!isOwned) {
      Alert.alert(
        "Verified Purchase Required",
        "To ensure trusted and genuine feedback for our community, only readers who have purchased and own this book can submit a review.\n\nPurchase this book to share your thoughts!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Buy Now", onPress: handleAddToCart },
        ],
      );
      return;
    }

    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!isOwned) {
      Alert.alert(
        "Verified Purchase Required",
        "You must own this book in your library to submit a review.",
      );
      return;
    }
    if (!newComment.trim()) {
      Alert.alert(
        "Review Required",
        "Please share your thoughts about this book before publishing.",
      );
      return;
    }
    const name =
      reviewerNameInput.trim() || user?.username || "Verified Reader";
    await addReview(book.id, {
      reviewerName: name,
      rating: newRating,
      comment: newComment.trim(),
    });
    setNewComment("");
    setNewRating(5);
    setIsReviewModalOpen(false);
    Alert.alert(
      "Review Published!",
      "Thank you for sharing your review with the Wonder Emporium community.",
    );
  };

  const isAudioSelected = selectedFormat.toLowerCase().includes("audio");

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Book Details</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => toggleWishlist(book)}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={22}
            color={isWishlisted ? "#EF4444" : Colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Book Hero */}
        <View style={styles.heroSection}>
          {coverUrl ? (
            <ExpoImage
              source={{ uri: coverUrl }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={styles.heroImage}>
              <Ionicons name="book" size={64} color={Colors.secondary} />
            </View>
          )}
          <View style={styles.heroDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <View style={styles.authorRow}>
            <Text style={styles.bookAuthor}>by {book.author}</Text>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.secondary}
            />
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={16}
                  color={Colors.secondary}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>4.8 (2,341 reviews)</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{displayPrice}</Text>
          </View>

          {isOwned ? (
            <TouchableOpacity
              style={styles.listenNowBtn}
              onPress={() => {
                if (isAudioSelected) {
                  navigation.navigate("AudiobookPlayer", {
                    bookId: book.id,
                    orderItemId: ownedLibraryItem?.orderItemId,
                    title: book.title,
                    author: book.author,
                    coverUrl: coverUrl,
                  });
                } else {
                  navigation.navigate("PdfReader", {
                    bookId: book.id,
                    orderItemId: ownedLibraryItem?.orderItemId,
                    title: book.title,
                    author: book.author,
                    coverUrl: coverUrl,
                  });
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isAudioSelected ? "headset" : "book-outline"}
                size={20}
                color={Colors.white}
              />
              <Text style={styles.listenNowText}>
                {isAudioSelected ? "LISTEN NOW" : "READ NOW"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <ActivityIndicator color={Colors.secondary} size="small" />
                ) : (
                  <Text style={styles.addToCartText}>ADD TO CART</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buyNowBtn}
                onPress={handleBuyNow}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.buyNowText}>BUY NOW</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Description</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={descExpanded ? undefined : 4}
          >
            In a quiet village nestled between mist-laden hills, a young woman
            named Elara discovers an ancient lantern that holds the power to
            reveal hidden truths. As she embarks on a journey to uncover its
            origins, she finds herself entangled in a web of secrets, lost love,
            and the timeless battle between light and shadow. Eleanor Whitfield
            weaves a hauntingly beautiful tale of self-discovery and the quiet
            strength found in solitude.
          </Text>
          <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)}>
            <Text style={styles.readMore}>
              {descExpanded ? "Show Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Format</Text>
          <View style={styles.formatRow}>
            {formats.map((fmt) => (
              <TouchableOpacity
                key={fmt}
                style={[
                  styles.formatChip,
                  selectedFormat === fmt && styles.formatChipSelected,
                ]}
                onPress={() => setSelectedFormat(fmt)}
              >
                <Text
                  style={[
                    styles.formatChipText,
                    selectedFormat === fmt && styles.formatChipTextSelected,
                  ]}
                >
                  {fmt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Selection</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <View key={cat} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Information</Text>
          <InfoRow label="Language" value="English" />
          <InfoRow label="Pages" value="348" />
          <InfoRow label="ISBN" value="978-1-9821-4477-0" />
          <InfoRow label="Publication" value="March 12, 2024" />
          <InfoRow label="Format" value="eBook" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Author</Text>
          <View style={styles.authorProfile}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={32} color={Colors.secondary} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Eleanor Whitfield</Text>
              <Text style={styles.authorStat}>42 Books Published</Text>
              <View style={styles.foundingBadge}>
                <Text style={styles.foundingBadgeText}>Founding Author</Text>
              </View>
            </View>
          </View>
          <Text style={styles.authorBio}>
            Eleanor Whitfield is an award-winning novelist celebrated for her
            lyrical prose and deeply moving narratives. With over four decades
            of literary achievement, her works have been translated into 28
            languages and have sold millions worldwide.
          </Text>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() =>
              navigation.navigate("AuthorProfile", {
                authorId:
                  (
                    book as unknown as {
                      authorId?: string;
                      author?: { id?: string };
                    }
                  )?.authorId ||
                  (book as unknown as { author?: { id?: string } })?.author
                    ?.id ||
                  "default-author",
                authorName: book.author || "Eleanor Whitfield",
              })
            }
          >
            <Text style={styles.viewProfileText}>VIEW AUTHOR PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Reader Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Reader Reviews</Text>
              <Text style={styles.reviewsCountText}>
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </Text>
            </View>
            <View style={styles.reviewsRightHeader}>
              <View style={styles.ratingBadgeSm}>
                <Ionicons name="star" size={13} color={Colors.secondary} />
                <Text style={styles.reviewsRating}>{avgRating}</Text>
              </View>
              {isOwned && (
                <TouchableOpacity
                  style={styles.writeReviewBtn}
                  onPress={handleOpenReviewModal}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color={DARK_GREEN}
                  />
                  <Text style={styles.writeReviewText}>Write a Review</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {reviews.slice(0, showAllReviews ? undefined : 2).map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewHeaderRow}>
                <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                <Text style={styles.reviewDate}>{rev.createdAt}</Text>
              </View>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= rev.rating ? "star" : "star-outline"}
                    size={13}
                    color={i <= rev.rating ? "#F59E0B" : Colors.gray[300]}
                  />
                ))}
              </View>
              <Text style={styles.reviewText}>{rev.comment}</Text>
            </View>
          ))}

          {reviews.length > 2 && (
            <TouchableOpacity
              onPress={() => setShowAllReviews(!showAllReviews)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllReviews}>
                {showAllReviews
                  ? "Show Less"
                  : `View All ${reviews.length} Reviews`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Popular Audiobooks Section */}
        {popularAudiobooks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Popular Audiobooks</Text>
              <TouchableOpacity
                onPress={handleViewAllAudiobooks}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {isAudiobooksLoading ? (
              <View style={{ padding: Spacing.md, alignItems: "center" }}>
                <ActivityIndicator size="small" color={Colors.secondary} />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularRow}
              >
                {popularAudiobooks.map((b) => (
                  <BookCardSm
                    key={b.id}
                    title={b.title}
                    author={b.author}
                    price={b.price}
                    rating={b.rating}
                    coverUrl={b.coverUrl}
                    onPress={() => handleAudiobookPress(b)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </ScrollView>

      {/* Write a Review Modal */}
      <Modal
        visible={isReviewModalOpen}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setIsReviewModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  {/* Top Bar with Title and Close */}
                  <View style={styles.modalTopBar}>
                    <Text style={styles.modalTitle}>Rate & Review</Text>
                    <TouchableOpacity
                      style={styles.modalCloseBtn}
                      onPress={() => setIsReviewModalOpen(false)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={Colors.gray[600]}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {book.title}
                  </Text>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                  >
                    {/* Star Rating Card */}
                    <View style={styles.ratingPickerCard}>
                      <View style={styles.starsSelectRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => setNewRating(star)}
                            style={styles.starBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={star <= newRating ? "star" : "star-outline"}
                              size={34}
                              color={
                                star <= newRating ? "#F59E0B" : Colors.gray[300]
                              }
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={styles.ratingDescriptiveText}>
                        {RATING_LABELS[newRating] || "Great"}
                      </Text>
                    </View>

                    {/* Quick Reaction Chips */}
                    <Text style={styles.inputLabel}>Quick Highlights</Text>
                    <View style={styles.chipsRow}>
                      {[
                        "Captivating",
                        "Well-Written",
                        "Great Narration",
                        "Inspiring",
                        "Must Read",
                      ].map((tag) => {
                        const isSelected = newComment.includes(tag);
                        return (
                          <TouchableOpacity
                            key={tag}
                            style={[
                              styles.highlightChip,
                              isSelected && styles.highlightChipActive,
                            ]}
                            onPress={() => {
                              if (!isSelected) {
                                setNewComment((prev) =>
                                  prev.trim()
                                    ? `${prev.trim()} ${tag}.`
                                    : `${tag}. `,
                                );
                              }
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.highlightChipText,
                                isSelected && styles.highlightChipTextActive,
                              ]}
                            >
                              +{tag}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Review Text Area */}
                    <View style={styles.inputHeaderRow}>
                      <Text style={styles.inputLabel}>Your Thoughts</Text>
                      <Text style={styles.charCountText}>
                        {newComment.length}/500
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Share your thoughts on the story, key takeaways, or pacing..."
                      placeholderTextColor={Colors.gray[400]}
                      value={newComment}
                      onChangeText={(text) => {
                        if (text.length <= 500) setNewComment(text);
                      }}
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                    />

                    {/* Reviewer Name */}
                    <Text style={styles.inputLabel}>Display Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={user?.username || "Verified Reader"}
                      placeholderTextColor={Colors.gray[400]}
                      value={reviewerNameInput}
                      onChangeText={setReviewerNameInput}
                    />

                    {/* Action Buttons */}
                    <View style={styles.modalButtonsRow}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setIsReviewModalOpen(false)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSubmitReview}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={Colors.white}
                        />
                        <Text style={styles.submitText}>Publish Review</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const DARK_GREEN = "#1B4332";
const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  backBtn: { width: 40, alignItems: "center" },
  topBarTitle: { ...Typography.h3, color: Colors.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },

  heroSection: { alignItems: "center", paddingVertical: Spacing.lg },
  heroImage: {
    width: 200,
    height: 260,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroDots: { flexDirection: "row", gap: 6, marginTop: Spacing.md },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  dotActive: { backgroundColor: Colors.secondary, width: 20 },

  infoSection: { paddingHorizontal: Spacing.lg },
  bookTitle: { ...Typography.h2, color: Colors.black },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  bookAuthor: { ...Typography.body, color: Colors.gray[500] },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  stars: { flexDirection: "row", gap: 2 },
  ratingText: { ...Typography.caption, color: Colors.gray[500] },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  oldPrice: {
    ...Typography.body,
    color: Colors.gray[400],
    textDecorationLine: "line-through",
  },
  currentPrice: {
    ...Typography.h2,
    color: Colors.secondary,
    fontWeight: "700",
  },
  actionRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
  addToCartBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  addToCartText: {
    ...Typography.button,
    color: Colors.secondary,
    fontWeight: "700",
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  buyNowText: { ...Typography.button, color: Colors.white, fontWeight: "700" },
  listenNowBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  listenNowText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Colors.black },
  descriptionText: {
    ...Typography.body,
    color: Colors.gray[600],
    lineHeight: 24,
    marginTop: Spacing.sm,
  },
  readMore: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },

  formatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  formatChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  formatChipSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: Colors.secondary,
  },
  formatChipText: { ...Typography.bodySmall, color: Colors.gray[600] },
  formatChipTextSelected: { color: Colors.black, fontWeight: "600" },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  categoryChipText: { ...Typography.caption, color: Colors.gray[600] },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  infoLabel: { ...Typography.body, color: Colors.gray[500] },
  infoValue: { ...Typography.body, color: Colors.black, fontWeight: "500" },

  authorProfile: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
    alignItems: "center",
  },
  authorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInfo: { flex: 1 },
  authorName: { ...Typography.h3, color: Colors.black, fontSize: 18 },
  authorStat: { ...Typography.caption, color: Colors.gray[500], marginTop: 2 },
  foundingBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  foundingBadgeText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: "600",
  },
  authorBio: {
    ...Typography.body,
    color: Colors.gray[600],
    lineHeight: 24,
    marginTop: Spacing.md,
  },
  viewProfileBtn: {
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  viewProfileText: {
    ...Typography.button,
    color: Colors.secondary,
    fontWeight: "700",
  },

  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  reviewsSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  reviewsCountText: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 2,
  },
  reviewsRightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ratingBadgeSm: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  reviewsRating: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.secondary,
  },
  writeReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(27, 67, 50, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  writeReviewText: {
    ...Typography.caption,
    fontWeight: "600",
    color: DARK_GREEN,
  },
  reviewCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.black,
  },
  reviewDate: {
    ...Typography.caption,
    color: Colors.gray[400],
    fontSize: 11,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 5,
    marginBottom: 4,
  },
  reviewText: {
    ...Typography.bodySmall,
    color: Colors.gray[700],
    lineHeight: 20,
    marginTop: 2,
  },
  viewAllReviews: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
    marginTop: Spacing.md,
    textAlign: "center",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  viewAll: { ...Typography.bodySmall, color: Colors.gray[500] },
  popularRow: { gap: Spacing.md, paddingRight: Spacing.lg },

  smBookCard: {
    width: 130,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  smBookCover: {
    height: 110,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
    overflow: "hidden",
    position: "relative",
  },
  smCoverImage: {
    width: "100%",
    height: "100%",
  },
  audioBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(27, 67, 50, 0.85)",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  smBookTitle: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.black,
  },
  smBookAuthor: { fontSize: 11, color: Colors.gray[500], marginTop: 1 },
  smBookFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  smBookPrice: { fontSize: 11, fontWeight: "600", color: Colors.secondary },
  smRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_GREEN,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    gap: 1,
  },
  smRatingText: { fontSize: 9, fontWeight: "600", color: Colors.white },

  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.black,
    marginTop: Spacing.sm,
  },
  modalSubtitle: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  ratingPickerCard: {
    backgroundColor: "#FAF9F6",
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    marginBottom: Spacing.md,
  },
  starsSelectRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  starBtn: {
    padding: 2,
  },
  ratingDescriptiveText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B45309",
    marginTop: 6,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  highlightChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  highlightChipActive: {
    backgroundColor: "#ECFDF5",
    borderColor: DARK_GREEN,
  },
  highlightChipText: {
    fontSize: 11,
    color: Colors.gray[600],
    fontWeight: "500",
  },
  highlightChipTextActive: {
    color: DARK_GREEN,
    fontWeight: "600",
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCountText: {
    fontSize: 11,
    color: Colors.gray[400],
  },
  inputLabel: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.gray[700],
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
  },
  cancelText: {
    ...Typography.bodySmall,
    color: Colors.gray[600],
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DARK_GREEN,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
    shadowColor: DARK_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: "700",
  },
});
