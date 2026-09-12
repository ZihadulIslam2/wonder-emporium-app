import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";

interface RefundDisclosureCardProps {
  onPress: () => void;
  style?: object;
}

export function RefundDisclosureCard({
  onPress,
  style,
}: RefundDisclosureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.cardContainer, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardIconWrapper}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.secondary} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>All Sales Are Final</Text>
          <View style={styles.noticeBadge}>
            <Text style={styles.noticeBadgeText}>NOTICE</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>
          Purchases cannot be cancelled or refunded.
        </Text>
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>View Refund Disclosure</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.secondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface RefundDisclosureModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RefundDisclosureModal({
  visible,
  onClose,
}: RefundDisclosureModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={Platform.OS === "android"}
    >
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={styles.modalBadgeIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={Colors.secondary}
                />
              </View>
              <Text style={styles.modalHeaderTitle}>Refund Disclosure</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Primary Warning Box */}
            <View style={styles.highlightBanner}>
              <Ionicons
                name="alert-circle"
                size={22}
                color="#B45309"
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>
                  Important: All Sales Are Final
                </Text>
                <Text style={styles.highlightDesc}>
                  Wonder Emporium connects readers directly with independent
                  authors and creative publishers. Due to immediate digital
                  delivery and custom physical order fulfillment, all sales are
                  strictly final and non-refundable.
                </Text>
              </View>
            </View>

            {/* Policy Points */}
            <View style={styles.pointsList}>
              <View style={styles.pointCard}>
                <View style={styles.pointIconBox}>
                  <Ionicons
                    name="book-outline"
                    size={18}
                    color={Colors.black}
                  />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>Instant Digital Access</Text>
                  <Text style={styles.pointDesc}>
                    Purchased eBooks and audiobooks are immediately added to
                    your library for reading and listening. Because digital
                    items cannot be revoked or returned, digital sales are
                    non-refundable.
                  </Text>
                </View>
              </View>

              <View style={styles.pointCard}>
                <View style={styles.pointIconBox}>
                  <Ionicons
                    name="cube-outline"
                    size={18}
                    color={Colors.black}
                  />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>
                    Physical Edition Deliveries
                  </Text>
                  <Text style={styles.pointDesc}>
                    Physical book shipments and limited author merch are
                    prepared promptly. Please verify your selected format and
                    shipping details before confirming your order.
                  </Text>
                </View>
              </View>

              <View style={styles.pointCard}>
                <View
                  style={[styles.pointIconBox, { backgroundColor: "#ECFDF5" }]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#059669"
                  />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>
                    Damaged or Defective Goods
                  </Text>
                  <Text style={styles.pointDesc}>
                    If your physical item arrives damaged or defective, contact
                    our support team within 48 hours of delivery with photos of
                    the damaged package and item for a replacement.
                  </Text>
                </View>
              </View>

              <View style={styles.pointCard}>
                <View
                  style={[styles.pointIconBox, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="heart-outline" size={18} color="#D97706" />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>
                    Creator-First Marketplace
                  </Text>
                  <Text style={styles.pointDesc}>
                    Your purchase directly pays and supports independent authors
                    and creators. Thank you for championing original
                    storytelling!
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Confirmation Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>I Understand & Accept</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 14,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.body,
    fontWeight: "700",
    color: "#78350F",
  },
  noticeBadge: {
    backgroundColor: "#FDE68A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noticeBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: "700",
    color: "#92400E",
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    fontSize: 13,
    color: Colors.gray[600],
    marginTop: 2,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.sm,
  },
  actionText: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: Platform.OS === "android" ? 40 : 0,
    borderTopLeftRadius: Platform.OS === "android" ? 20 : 0,
    borderTopRightRadius: Platform.OS === "android" ? 20 : 0,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  modalBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderTitle: {
    ...Typography.h3,
    color: Colors.black,
    fontWeight: "700",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray[100],
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  highlightBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  highlightTitle: {
    ...Typography.body,
    fontWeight: "700",
    color: "#78350F",
  },
  highlightDesc: {
    ...Typography.bodySmall,
    color: "#92400E",
    marginTop: 4,
    lineHeight: 19,
  },
  pointsList: {
    gap: Spacing.sm,
  },
  pointCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  pointIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  pointContent: {
    flex: 1,
  },
  pointTitle: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  pointDesc: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.gray[600],
    marginTop: 3,
    lineHeight: 17,
  },
  modalFooter: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  confirmBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: "700",
  },
});
