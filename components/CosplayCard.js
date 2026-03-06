// components/CosplayCard.js
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "./Button";
import placeholder from "../assets/placeholder.png";
import { useTheme } from "../contexts/ThemeContext";

export default function CosplayCard({ cosplay, onEdit, onDelete, onItemToggle, navigation }) {
  const { theme, spacing, borderRadius, shadows, fontSize, fontWeight } = useTheme();
  const [broken, setBroken] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsFetched, setEventsFetched] = useState(false);

  const imageSource = broken || !cosplay.imageUrl ? placeholder : { uri: cosplay.imageUrl };
  const items = cosplay.items || [];
  const completedCount = items.filter((item) => item.isChecked).length;
  const totalCost = items.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
  const remainingCost = items.filter((item) => !item.isChecked).reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const toggleItem = async (itemId) => {
    if (togglingIds.includes(itemId)) return;
    setTogglingIds((prev) => [...prev, itemId]);
    const updatedItems = items.map((item) => item.id === itemId ? { ...item, isChecked: !item.isChecked } : item);
    try {
      await updateDoc(doc(db, "cosplays", cosplay.id), { items: updatedItems });
      if (onItemToggle) onItemToggle(cosplay.id, updatedItems);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const q = query(collection(db, "events"), where("cosplayId", "==", cosplay.id));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setEvents(list);
      setEventsFetched(true);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleToggleEvents = () => {
    const opening = !eventsOpen;
    setEventsOpen(opening);
    if (opening && !eventsFetched) fetchEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceLight, ...shadows.lg }]}>

      {/* Top row: large image left (progress bar overlay only), info right */}
      <View style={{ flexDirection: "row", height: 160 }}>
        {/* Image with progress bar overlaid at bottom */}
        <View style={{ width: 140, position: "relative", overflow: "hidden", borderRadius: 16, marginLeft: 12, marginVertical: 12 }}>
          <Image
            source={imageSource}
            style={{ width: "100%", height: "100%" }}
            onError={() => setBroken(true)}
            resizeMode="cover"
          />
          {items.length > 0 && (
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: spacing[2], paddingVertical: spacing[2] }}>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
                <View style={{ height: "100%", borderRadius: 3, backgroundColor: theme.success, width: `${progressPercentage}%` }} />
              </View>
              <Text style={{ fontSize: fontSize.xs, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
                {completedCount}/{items.length} done
              </Text>
            </View>
          )}
        </View>

        {/* Info section on the right */}
        <View style={{ flex: 1, padding: spacing[4], justifyContent: "center" }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: theme.text, marginBottom: spacing[3] }} numberOfLines={2}>
            {cosplay.characterName}
          </Text>
          {cosplay.deadline && (
            <View style={{ marginBottom: spacing[2] }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.textTertiary, textTransform: "uppercase" }}>Deadline</Text>
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: theme.primary }}>{cosplay.deadline}</Text>
            </View>
          )}
          {cosplay.location && (
            <View>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.textTertiary, textTransform: "uppercase" }}>Location</Text>
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: theme.text }} numberOfLines={2}>{cosplay.location}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing[4], paddingBottom: spacing[4] }}>
        {/* Cost Summary */}
        <View style={{ backgroundColor: theme.primaryLighter, borderRadius: borderRadius.lg, paddingVertical: spacing[3], paddingHorizontal: spacing[4], marginBottom: spacing[4] }}>
          <View style={styles.costRow}>
            <View>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.primaryDark, textTransform: "uppercase", marginBottom: spacing[1] }}>Total Budget</Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: theme.primary }}>₱{totalCost.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: theme.primaryDark, textTransform: "uppercase", marginBottom: spacing[1] }}>Still Needed</Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: remainingCost > 0 ? theme.warning : theme.success }}>₱{remainingCost.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Shopping List */}
        {items.length > 0 && (
          <View style={{ marginBottom: spacing[4] }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: theme.textSecondary, textTransform: "uppercase", marginBottom: spacing[2], letterSpacing: 0.5 }}>
              Shopping List
            </Text>
            <View style={[{ borderRadius: borderRadius.md }, styles.itemsList]}>
              {items.map((item, index) => {
                const isToggling = togglingIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: spacing[3], paddingHorizontal: spacing[3], borderBottomWidth: index < items.length - 1 ? 1 : 0, borderBottomColor: theme.border, backgroundColor: item.isChecked ? theme.successLight : "transparent" }}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.6}
                  >
                    <View style={{ width: 28, height: 28, borderRadius: borderRadius.md, borderWidth: 2, borderColor: item.isChecked ? theme.success : theme.border, backgroundColor: item.isChecked ? theme.success : "transparent", alignItems: "center", justifyContent: "center", marginRight: spacing[3] }}>
                      {isToggling ? (
                        <ActivityIndicator size="small" color={theme.textInvert} />
                      ) : item.isChecked ? (
                        <Text style={{ color: theme.textInvert, fontSize: 14, fontWeight: fontWeight.bold }}>✓</Text>
                      ) : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.medium, color: item.isChecked ? theme.textSecondary : theme.text, textDecorationLine: item.isChecked ? "line-through" : "none" }} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: item.isChecked ? theme.textSecondary : theme.primary, marginLeft: spacing[2] }}>
                      ₱{parseFloat(item.cost || 0).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Upcoming Events Dropdown */}
        <View>
          <TouchableOpacity
            onPress={handleToggleEvents}
            activeOpacity={0.7}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.primaryLighter, borderRadius: borderRadius.lg, paddingVertical: spacing[3], paddingHorizontal: spacing[4] }}
          >
            <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: theme.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>
              📅 Upcoming Events
            </Text>
            <Text style={{ fontSize: fontSize.lg, color: theme.primary }}>{eventsOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {eventsOpen && (
            <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: theme.border, borderBottomLeftRadius: borderRadius.lg, borderBottomRightRadius: borderRadius.lg, overflow: "hidden" }}>
              {eventsLoading ? (
                <View style={{ padding: spacing[4], alignItems: "center" }}>
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : events.length === 0 ? (
                <View style={{ padding: spacing[4], alignItems: "center" }}>
                  <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing[3] }}>No events yet for this cosplay.</Text>
                  <Button title="+ Add Event" variant="secondary" size="sm" onPress={() => navigation.navigate("Add Event", { cosplayId: cosplay.id, cosplayName: cosplay.characterName })} />
                </View>
              ) : (
                <View>
                  {events.map((event, index) => (
                    <View key={event.id} style={{ paddingVertical: spacing[3], paddingHorizontal: spacing[4], borderBottomWidth: index < events.length - 1 ? 1 : 0, borderBottomColor: theme.border, backgroundColor: theme.background }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1, marginRight: spacing[2] }}>
                          <Text style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: theme.text, marginBottom: spacing[1] }}>{event.name}</Text>
                          {event.date ? <Text style={{ fontSize: fontSize.sm, color: theme.primary, marginBottom: spacing[1] }}>📆 {event.date}</Text> : null}
                          {event.location ? <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing[1] }}>📍 {event.location}</Text> : null}
                          {event.description ? <Text style={{ fontSize: fontSize.xs, color: theme.textTertiary }} numberOfLines={2}>{event.description}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteEvent(event.id)} style={{ backgroundColor: theme.danger, borderRadius: borderRadius.md, paddingHorizontal: spacing[2], paddingVertical: spacing[1] }}>
                          <Text style={{ color: theme.textInvert, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <View style={{ padding: spacing[3], borderTopWidth: 1, borderTopColor: theme.border }}>
                    <Button title="+ Add Event" variant="secondary" size="sm" fullWidth={true} onPress={() => navigation.navigate("Add Event", { cosplayId: cosplay.id, cosplayName: cosplay.characterName })} />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", gap: spacing[2], padding: spacing[4], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: theme.border }}>
        <Button title="Edit" variant="outline" onPress={onEdit} size="md" fullWidth={true} style={{ flex: 1 }} />
        <Button title="Delete" variant="danger" onPress={onDelete} size="md" fullWidth={true} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, marginBottom: 16, overflow: "hidden" },
  costRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  divider: { width: 1, height: 50, backgroundColor: "rgba(0,0,0,0.1)" },
  itemsList: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden" },
});