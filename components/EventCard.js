// components/EventCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "./Button";
import { useTheme } from "../contexts/ThemeContext";

export default function EventCard({ event, onDelete }) {
  const { theme, spacing, borderRadius, shadows, fontSize, fontWeight } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceLight, borderRadius: borderRadius.xl, ...shadows.md }]}>
      <View style={{ height: 6, backgroundColor: theme.secondary, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl }} />
      <View style={{ padding: spacing[4] }}>
        <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: theme.text, marginBottom: spacing[3] }} numberOfLines={2}>
          {event.name}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing[4], marginBottom: spacing[3] }}>
          {event.date ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.textTertiary, textTransform: "uppercase", marginBottom: spacing[1] }}>Date</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.medium, color: theme.primary }}>📆 {event.date}</Text>
            </View>
          ) : null}
          {event.location ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.textTertiary, textTransform: "uppercase", marginBottom: spacing[1] }}>Location</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.medium, color: theme.text }} numberOfLines={1}>📍 {event.location}</Text>
            </View>
          ) : null}
        </View>
        {event.description ? (
          <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, lineHeight: 20, marginBottom: spacing[3] }} numberOfLines={3}>
            {event.description}
          </Text>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: spacing[4], paddingBottom: spacing[4], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: theme.border }}>
        <Button title="Delete Event" variant="danger" size="md" fullWidth={true} onPress={onDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ card: { marginBottom: 16, overflow: "hidden" } });