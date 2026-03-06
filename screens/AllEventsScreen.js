// screens/AllEventsScreen.js
import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView, Platform, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { useTheme } from "../contexts/ThemeContext";

export default function AllEventsScreen() {
  const { theme, spacing, fontSize, fontWeight, borderRadius, shadows } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "events"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setEvents(list);
    } catch (err) {
      console.error("Fetch events failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchEvents(); }, []));

  const deleteEvent = async (id) => {
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete event failed:", err);
    }
  };

  const Container = Platform.OS === "web" ? View : SafeAreaView;

  const renderItem = ({ item }) => (
    <View style={{ backgroundColor: theme.surfaceLight, borderRadius: borderRadius.xl, marginBottom: spacing[4], overflow: "hidden", ...shadows.md }}>
      <View style={{ height: 5, backgroundColor: theme.secondary }} />
      <View style={{ padding: spacing[4] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing[3] }}>
          <Text style={{ flex: 1, fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: theme.text, marginRight: spacing[2] }} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={() => deleteEvent(item.id)}
            style={{ backgroundColor: theme.danger, borderRadius: borderRadius.md, paddingHorizontal: spacing[2], paddingVertical: spacing[1] }}
          >
            <Text style={{ color: theme.textInvert, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: spacing[4], marginBottom: item.description ? spacing[3] : 0 }}>
          {item.date ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.textTertiary, textTransform: "uppercase", marginBottom: spacing[1] }}>Date</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.medium, color: theme.primary }}>📆 {item.date}</Text>
            </View>
          ) : null}
          {item.location ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.textTertiary, textTransform: "uppercase", marginBottom: spacing[1] }}>Location</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.medium, color: theme.text }} numberOfLines={1}>📍 {item.location}</Text>
            </View>
          ) : null}
        </View>

        {item.description ? (
          <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, lineHeight: 20 }} numberOfLines={3}>{item.description}</Text>
        ) : null}
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
      <Text style={{ fontSize: 40, marginBottom: spacing[3] }}>📅</Text>
      <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: theme.text, marginBottom: spacing[2], textAlign: "center" }}>No Events Yet</Text>
      <Text style={{ fontSize: fontSize.base, color: theme.textSecondary, textAlign: "center", paddingHorizontal: spacing[6] }}>
        Open a cosplay card and tap the Upcoming Events dropdown to add events.
      </Text>
    </View>
  );

  return (
    <Container style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ paddingHorizontal: spacing[4], paddingVertical: spacing[4], backgroundColor: theme.primaryLighter, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <Text style={{ fontSize: fontSize["3xl"], fontWeight: fontWeight.bold, color: theme.primary, marginBottom: spacing[1] }}>Upcoming Events</Text>
        <Text style={{ fontSize: fontSize.base, color: theme.textSecondary }}>All your cosplay events in one place</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing[4], paddingVertical: spacing[4] }}
          ListEmptyComponent={ListEmpty}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });