import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";

export type TodayNextAction = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  priority: "urgent" | "normal" | "setup";
};

type NextActionInput = {
  pendingReview: number;
  cubsCount: number;
  activeTasksCount: number;
  sentBackCount: number;
  inProgressWithFocus: { title: string; href: string } | null;
  familyDayPending: boolean;
  familyDayInProgress: boolean;
  weekQuery: string;
};

export function getTodayNextAction(input: NextActionInput): TodayNextAction {
  const {
    pendingReview,
    cubsCount,
    activeTasksCount,
    sentBackCount,
    inProgressWithFocus,
    familyDayPending,
    familyDayInProgress,
    weekQuery,
  } = input;

  if (pendingReview > 0) {
    return {
      title:
        pendingReview === 1
          ? "1 item needs your review"
          : `${pendingReview} items need your review`,
      description: "Approve, send back, or reject submitted tasks and routine check-ins.",
      href: "/dashboard/tasks/review",
      buttonLabel: "Review now",
      priority: "urgent",
    };
  }

  if (cubsCount === 0) {
    return {
      title: "Add your first Cub",
      description: "Create a profile to assign tasks and track earned phone time.",
      href: "/dashboard/cubs/new",
      buttonLabel: "Add Cub",
      priority: "setup",
    };
  }

  if (inProgressWithFocus) {
    return {
      title: `Instructions open: ${inProgressWithFocus.title}`,
      description: "A request timer is running. Submit when the task is done.",
      href: inProgressWithFocus.href,
      buttonLabel: "Continue task",
      priority: "normal",
    };
  }

  if (sentBackCount > 0) {
    return {
      title:
        sentBackCount === 1
          ? "1 task was sent back"
          : `${sentBackCount} tasks were sent back`,
      description: "Help your Cub fix and resubmit their work.",
      href: "/dashboard/tasks#active",
      buttonLabel: "View tasks",
      priority: "normal",
    };
  }

  if (activeTasksCount === 0) {
    return {
      title: "Assign a task",
      description: "Pick something from the board or create a new task for today.",
      href: "/dashboard/tasks",
      buttonLabel: "Go to Tasks",
      priority: "normal",
    };
  }

  if (familyDayInProgress) {
    return {
      title: `Continue ${FAMILY_DAY_LABEL}`,
      description: "Finish weekly reflections and credit bonuses.",
      href: `/dashboard/family-day?week=${weekQuery}`,
      buttonLabel: `Continue ${FAMILY_DAY_LABEL}`,
      priority: "normal",
    };
  }

  if (familyDayPending) {
    return {
      title: `${FAMILY_DAY_LABEL} is ready`,
      description: "Weekly check-in — reflect on wins and growth together.",
      href: `/dashboard/family-day?week=${weekQuery}`,
      buttonLabel: `Run ${FAMILY_DAY_LABEL}`,
      priority: "normal",
    };
  }

  return {
    title: "You're on track",
    description: "Check active tasks or view Cub progress.",
    href: "/dashboard/tasks#active",
    buttonLabel: "View active tasks",
    priority: "normal",
  };
}
