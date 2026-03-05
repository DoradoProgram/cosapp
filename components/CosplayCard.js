// components/CosplayCard.js
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "./Button";
import placeholder from "../assets/placeholder.png";
import { useTheme } from "../contexts/ThemeContext";

export default function CosplayCard({ cosplay, onEdit, onDelete, onItemToggle }) {
  const { theme, spacing, borderRadius, shadows, fontSize, fontWeight } = useTheme();
  const [broken, setBroken] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);

  const imageSource = broken || !cosplay.imageUrl ? placeholder : { uri: cosplay.imageUrl };
  const items = cosplay.items || [];
  const completedCount = items.filter((item) => item.isChecked).length;
  const totalCost = items.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
  const remainingCost = items
    .filter((item) => !item.isChecked)
    .reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);

  const toggleItem = async (itemId) => {
    if (togglingIds.includes(itemId)) return;
    setTogglingIds((prev) => [...prev, itemId]);

    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    try {
      const cosplayRef = doc(db, "cosplays", cosplay.id);
      await updateDoc(cosplayRef, { items: updatedItems });
      if (onItemToggle) onItemToggle(cosplay.id, updatedItems);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceLight, ...shadows.lg, minHeight: 200 }]}>
      {/* Horizontal Row Layout: Image (left) and All Content (right) */}
      <View style={{ flexDirection: "row", flex: 1 }}>
        {/* Left: Image - Full height of card, prominent width */}
        <View style={[styles.imageContainer, { width: 180, flex: 1, margin: 0 }]}>
          <Image
            source={imageSource}
            style={styles.image}
            onError={() => setBroken(true)}
            resizeMode="cover"
          />
          {items.length > 0 && (
            <View style={[styles.progressOverlay, { backgroundColor: `rgba(0,0,0,0.4)` }]}>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.success,
                      width: `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {completedCount}/{items.length}
              </Text>
            </View>
          )}
        </View>

        {/* Right: All Content Section */}
        <View style={{ flex: 2, padding: spacing[4], justifyContent: "space-between" }}>
          {/* Top Content: Title, Meta, Cost */}
          <View>
            {/* Title */}
            <Text
              style={{
                fontSize: fontSize["2xl"],
                fontWeight: fontWeight.bold,
                color: theme.text,
                marginBottom: spacing[2],
              }}
              numberOfLines={2}
            >
              {cosplay.characterName}
            </Text>

            {/* Quick Info Grid */}
            <View style={styles.metaGrid}>
              {cosplay.deadline && (
                <View style={styles.metaItem}>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.semibold,
                      color: theme.textTertiary,
                      textTransform: "uppercase",
                      marginBottom: spacing[1],
                    }}
                  >
                    Deadline
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: fontWeight.medium,
                      color: theme.primary,
                    }}
                  >
                    {cosplay.deadline}
                  </Text>
                </View>
              )}

              {cosplay.location && (
                <View style={styles.metaItem}>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.semibold,
                      color: theme.textTertiary,
                      textTransform: "uppercase",
                      marginBottom: spacing[1],
                    }}
                  >
                    Location
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: fontWeight.medium,
                      color: theme.text,
                    }}
                    numberOfLines={1}
                  >
                    {cosplay.location}
                  </Text>
                </View>
              )}
            </View>

            {/* Cost Summary */}
            <View
              style={[
                styles.costSummary,
                {
                  backgroundColor: theme.primaryLighter,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing[2],
                  paddingHorizontal: spacing[3],
                  marginTop: spacing[3],
                },
              ]}
            >
              <View style={styles.costRow}>
                <View>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.semibold,
                      color: theme.primaryDark,
                      textTransform: "uppercase",
                      marginBottom: spacing[1],
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: fontWeight.bold,
                      color: theme.primary,
                    }}
                  >
                    ₱{totalCost.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.semibold,
                      color: theme.primaryDark,
                      textTransform: "uppercase",
                      marginBottom: spacing[1],
                    }}
                  >
                    Remaining
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: fontWeight.bold,
                      color: remainingCost > 0 ? theme.warning : theme.success,
                    }}
                  >
                    ₱{remainingCost.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items Checklist */}
            {items.length > 0 && (
              <View style={{ marginTop: spacing[3] }}>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.bold,
                    color: theme.textSecondary,
                    textTransform: "uppercase",
                    marginBottom: spacing[2],
                    letterSpacing: 0.5,
                  }}
                >
                  Shopping List
                </Text>

                <View style={[{ borderRadius: borderRadius.md }, styles.itemsList]}>
                  {items.slice(0, 3).map((item, index) => { // Show only first 3 items
                    const isToggling = togglingIds.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: spacing[2],
                            paddingHorizontal: spacing[2],
                            borderBottomWidth: index < Math.min(items.length - 1, 2) ? 1 : 0,
                            borderBottomColor: theme.border,
                            backgroundColor: item.isChecked ? theme.successLight : "transparent",
                          },
                        ]}
                        onPress={() => toggleItem(item.id)}
                        activeOpacity={0.6}
                      >
                        {/* Checkbox */}
                        <View
                          style={[
                            {
                              width: 20,
                              height: 20,
                              borderRadius: borderRadius.sm,
                              borderWidth: 2,
                              borderColor: item.isChecked ? theme.success : theme.border,
                              backgroundColor: item.isChecked ? theme.success : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: spacing[2],
                            },
                          ]}
                        >
                          {isToggling ? (
                            <ActivityIndicator size="small" color={theme.textInvert} />
                          ) : item.isChecked ? (
                            <Text style={{ color: theme.textInvert, fontSize: 12, fontWeight: fontWeight.bold }}>✓</Text>
                          ) : null}
                        </View>

                        {/* Item details */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: fontSize.sm,
                              fontWeight: fontWeight.medium,
                              color: item.isChecked ? theme.textSecondary : theme.text,
                              textDecorationLine: item.isChecked ? "line-through" : "none",
                            }}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                        </View>

                        {/* Cost */}
                        <Text
                          style={{
                            fontSize: fontSize.sm,
                            fontWeight: fontWeight.bold,
                            color: item.isChecked ? theme.textSecondary : theme.primary,
                          }}
                        >
                          ₱{parseFloat(item.cost || 0).toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {items.length > 3 && (
                    <View style={{ paddingVertical: spacing[1], paddingHorizontal: spacing[2] }}>
                      <Text style={{ fontSize: fontSize.xs, color: theme.textTertiary }}>
                        +{items.length - 3} more items...
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Bottom: Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: spacing[2],
              marginTop: spacing[3],
            }}
          >
            <Button
              title="Edit"
              variant="outline"
              onPress={onEdit}
              size="sm"
              fullWidth={true}
              style={{ flex: 1 }}
            />
            <Button
              title="Delete"
              variant="danger"
              onPress={onDelete}
              size="sm"
              fullWidth={true}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  header: {
    marginBottom: 8,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flex: 1,
  },
  costSummary: {
    justifyContent: "center",
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  itemsList: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
});
