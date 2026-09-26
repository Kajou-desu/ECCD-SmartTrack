import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { useWeeklyGoalsQuery } from "./useWeeklyGoalsQuery.js";
import { mondayOf, addDays, toWeekKey } from "../utils/week.js";

export const GOAL_MODAL = {
  NONE: null,
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  GRADE: "grade",
};

export function useWeeklyGoals() {
  const queryClient = useQueryClient();

  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [session, setSession] = useState("morning");
  const weekKey = useMemo(() => toWeekKey(weekStart), [weekStart]);

  const { data: goals = [], isLoading, isError, refetch } = useWeeklyGoalsQuery(weekKey, session);

  const [modalType, setModalType] = useState(GOAL_MODAL.NONE);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => setToast({ type, message }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const goToPreviousWeek = useCallback(() => setWeekStart((w) => addDays(w, -7)), []);
  const goToNextWeek = useCallback(() => setWeekStart((w) => addDays(w, 7)), []);
  const goToCurrentWeek = useCallback(() => setWeekStart(mondayOf()), []);

  const closeModal = useCallback(() => {
    setModalType(GOAL_MODAL.NONE);
    setSelectedGoal(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelectedGoal(null);
    setModalType(GOAL_MODAL.CREATE);
  }, []);

  const openEditModal = useCallback((goal) => {
    setSelectedGoal(goal);
    setModalType(GOAL_MODAL.EDIT);
  }, []);

  const openDeleteModal = useCallback((goal) => {
    setSelectedGoal(goal);
    setModalType(GOAL_MODAL.DELETE);
  }, []);

  const openGradeModal = useCallback((goal) => {
    setSelectedGoal(goal);
    setModalType(GOAL_MODAL.GRADE);
  }, []);

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["weeklyGoals"] }),
    [queryClient],
  );

  const confirmAdd = useCallback(
    async ({ title, description, category }) => {
      try {
        await apiClient.createWeeklyGoal({ weekStart: weekKey, session, title, description, category });
        invalidate();
        closeModal();
        showToast("success", `"${title}" was added.`);
      } catch (err) {
        showToast("error", err.message || "Failed to add goal. Please try again.");
      }
    },
    [weekKey, session, invalidate, closeModal, showToast],
  );

  const confirmEdit = useCallback(
    async ({ title, description, category }) => {
      if (!selectedGoal) return;
      try {
        await apiClient.updateWeeklyGoal(selectedGoal.id, { title, description, category });
        invalidate();
        closeModal();
        showToast("success", `"${title}" was updated.`);
      } catch (err) {
        showToast("error", err.message || "Failed to update goal. Please try again.");
      }
    },
    [selectedGoal, invalidate, closeModal, showToast],
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedGoal) return;
    try {
      await apiClient.deleteWeeklyGoal(selectedGoal.id);
      invalidate();
      showToast("success", `"${selectedGoal.title}" was deleted.`);
      closeModal();
    } catch (err) {
      showToast("error", err.message || "Failed to delete goal. Please try again.");
    }
  }, [selectedGoal, invalidate, showToast, closeModal]);

  const confirmGrade = useCallback(
    async (updates) => {
      if (!selectedGoal) return;
      try {
        await apiClient.updateGoalProgress(selectedGoal.id, updates);
        invalidate();
        closeModal();
        showToast("success", "Progress saved.");
      } catch (err) {
        showToast("error", err.message || "Failed to save progress. Please try again.");
      }
    },
    [selectedGoal, invalidate, closeModal, showToast],
  );

  return {
    goals,
    loading: isLoading,
    error: isError ? "Unable to load weekly goals. Please try again." : "",
    retry: refetch,
    weekStart,
    weekKey,
    session,
    setSession,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    modalType,
    selectedGoal,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openGradeModal,
    closeModal,
    confirmAdd,
    confirmEdit,
    confirmDelete,
    confirmGrade,
    toast,
    dismissToast,
  };
}

export default useWeeklyGoals;
