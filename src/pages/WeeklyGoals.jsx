import { useWeeklyGoals, GOAL_MODAL } from "@features/weeklyGoals/hooks/useWeeklyGoals";
import WeeklyGoalsToolbar from "@features/weeklyGoals/components/WeeklyGoalsToolbar";
import WeeklyGoalsList from "@features/weeklyGoals/components/WeeklyGoalsList";
import WeeklyGoalsLoadingState from "@features/weeklyGoals/components/WeeklyGoalsLoadingState";
import GoalFormModal from "@features/weeklyGoals/components/GoalFormModal";
import DeleteGoalModal from "@features/weeklyGoals/components/DeleteGoalModal";
import GradeGoalModal from "@features/weeklyGoals/components/GradeGoalModal";
import ErrorMsg from "@components/ui/ErrorMsg";
import { Toast } from "@components/ui/Toast";

export default function WeeklyGoals() {
  const {
    goals,
    loading,
    error,
    retry,
    weekStart,
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
  } = useWeeklyGoals();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#f8f9ff] p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Weekly Goals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Set this week's classroom goals and track each student's progress.
          </p>
        </div>

        <WeeklyGoalsToolbar
          weekStart={weekStart}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onCurrentWeek={goToCurrentWeek}
          session={session}
          onSessionChange={setSession}
          onAddGoal={openCreateModal}
        />

        {error && <ErrorMsg message={error} onClose={retry} />}

        {loading ? (
          <WeeklyGoalsLoadingState />
        ) : (
          <WeeklyGoalsList
            goals={goals}
            onGrade={openGradeModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onAddGoal={openCreateModal}
          />
        )}
      </div>

      {modalType === GOAL_MODAL.CREATE && (
        <GoalFormModal mode="create" onCancel={closeModal} onConfirm={confirmAdd} />
      )}

      {modalType === GOAL_MODAL.EDIT && selectedGoal && (
        <GoalFormModal mode="edit" goal={selectedGoal} onCancel={closeModal} onConfirm={confirmEdit} />
      )}

      {modalType === GOAL_MODAL.DELETE && selectedGoal && (
        <DeleteGoalModal goal={selectedGoal} onCancel={closeModal} onConfirm={confirmDelete} />
      )}

      {modalType === GOAL_MODAL.GRADE && selectedGoal && (
        <GradeGoalModal goal={selectedGoal} onCancel={closeModal} onConfirm={confirmGrade} />
      )}

      {toast && <Toast {...toast} onClose={dismissToast} />}
    </main>
  );
}
