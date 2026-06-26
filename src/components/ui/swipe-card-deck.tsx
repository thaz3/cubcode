"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

const SWIPE_THRESHOLD_PX = 56;
const SWIPE_INTENT_PX = 10;

function getChildMissionId(child: ReactElement): string | null {
  const props = child.props as { id?: string; children?: ReactNode };
  if (typeof props.id === "string") {
    return props.id;
  }

  const nestedChild = props.children;
  if (isValidElement(nestedChild)) {
    const nestedId = (nestedChild.props as { id?: string }).id;
    if (typeof nestedId === "string") {
      return nestedId;
    }
  }

  return null;
}

type SwipeCardDeckProps = {
  children: ReactNode;
  className?: string;
  emptyLabel?: string;
};

export function SwipeCardDeck({
  children,
  className,
  emptyLabel = "Nothing to show",
}: SwipeCardDeckProps) {
  const childArray = Children.toArray(children).filter(isValidElement);
  const childCount = childArray.length;
  const childKeys = childArray.map((child, index) => child.key ?? `deck-${index}`);

  const [order, setOrder] = useState<number[]>(() =>
    childArray.map((_, index) => index),
  );
  const [activeStep, setActiveStep] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const deckRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dragXRef = useRef(0);
  const isTrackingRef = useRef(false);
  const isSwipeGestureRef = useRef(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    setOrder(childArray.map((_, index) => index));
    setActiveStep(0);
    setDragX(0);
    setIsSwipeActive(false);
    setIsAnimating(false);
    isAnimatingRef.current = false;
  }, [childCount, childKeys.join("|")]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || childCount === 0) return;

    const targetIndex = childArray.findIndex((child) => {
      if (!isValidElement(child)) return false;
      return getChildMissionId(child) === hash;
    });

    if (targetIndex < 0) return;

    setOrder([
      targetIndex,
      ...childArray.map((_, index) => index).filter((index) => index !== targetIndex),
    ]);
    setActiveStep(targetIndex);
  }, [childArray, childCount, childKeys.join("|")]);

  const rotateNext = useCallback(() => {
    if (childCount <= 1 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    const width = deckRef.current?.offsetWidth || 320;
    setDragX(-width);

    window.setTimeout(() => {
      setOrder((prev) => [...prev.slice(1), prev[0]!]);
      setActiveStep((step) => (step + 1) % childCount);
      setDragX(0);
      setIsAnimating(false);
      isAnimatingRef.current = false;
    }, 240);
  }, [childCount]);

  const rotatePrevious = useCallback(() => {
    if (childCount <= 1 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    const width = deckRef.current?.offsetWidth || 320;
    setDragX(width);

    window.setTimeout(() => {
      setOrder((prev) => [prev[prev.length - 1]!, ...prev.slice(0, -1)]);
      setActiveStep((step) => (step - 1 + childCount) % childCount);
      setDragX(0);
      setIsAnimating(false);
      isAnimatingRef.current = false;
    }, 240);
  }, [childCount]);

  function resetGesture() {
    isTrackingRef.current = false;
    isSwipeGestureRef.current = false;
    pointerIdRef.current = null;
    dragXRef.current = 0;
    setIsSwipeActive(false);
    setDragX(0);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (childCount <= 1 || isAnimatingRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    dragXRef.current = 0;
    isTrackingRef.current = true;
    isSwipeGestureRef.current = false;
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isTrackingRef.current || pointerIdRef.current !== event.pointerId) return;

    const deltaX = event.clientX - startXRef.current;
    const deltaY = event.clientY - startYRef.current;

    if (!isSwipeGestureRef.current) {
      if (Math.abs(deltaX) < SWIPE_INTENT_PX && Math.abs(deltaY) < SWIPE_INTENT_PX) {
        return;
      }

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        resetGesture();
        return;
      }

      isSwipeGestureRef.current = true;
      setIsSwipeActive(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    dragXRef.current = deltaX;
    setDragX(deltaX);
  }

  function finishDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isTrackingRef.current || pointerIdRef.current !== event.pointerId) return;

    const wasSwipe = isSwipeGestureRef.current;
    const finalDragX = dragXRef.current;

    if (wasSwipe && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetGesture();

    if (!wasSwipe) return;

    event.preventDefault();

    if (Math.abs(finalDragX) >= SWIPE_THRESHOLD_PX) {
      if (finalDragX < 0) {
        rotateNext();
      } else {
        rotatePrevious();
      }
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      rotateNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      rotatePrevious();
    }
  }

  if (childCount === 0) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>;
  }

  if (childCount === 1) {
    return <div className={className}>{childArray[0]}</div>;
  }

  const frontIndex = order[0]!;
  const nextIndex = order[1]!;
  const previousIndex = order[order.length - 1]!;
  const showNext = dragX < 0 || (isAnimating && dragX < 0);
  const showPrevious = dragX > 0 || (isAnimating && dragX > 0);
  const slideTransition = isAnimating && !isSwipeActive;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
        <span>
          Card {activeStep + 1} of {childCount}
        </span>
        <span className="text-xs">Swipe left or right</span>
      </div>

      <div
        ref={deckRef}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          isSwipeActive ? "touch-none" : "touch-pan-y",
        )}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        tabIndex={0}
        role="region"
        aria-label="Swipeable card deck"
        aria-roledescription="carousel"
      >
        {showPrevious ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-0",
              slideTransition && "transition-transform duration-200 ease-out",
            )}
            style={{ transform: `translateX(calc(-100% + ${dragX}px))` }}
            aria-hidden
          >
            {childArray[previousIndex]}
          </div>
        ) : null}

        {showNext ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-0",
              slideTransition && "transition-transform duration-200 ease-out",
            )}
            style={{ transform: `translateX(calc(100% + ${dragX}px))` }}
            aria-hidden
          >
            {childArray[nextIndex]}
          </div>
        ) : null}

        <div
          className={cn(
            "relative z-10",
            isSwipeActive && "select-none",
            slideTransition && "transition-transform duration-200 ease-out",
            !isSwipeActive && !isAnimating && "cursor-grab active:cursor-grabbing",
          )}
          style={{ transform: `translateX(${dragX}px)` }}
        >
          {childArray[frontIndex]}
        </div>
      </div>

      <div
        className="flex justify-center gap-1.5"
        role="tablist"
        aria-label="Card position"
      >
        {childArray.map((_, index) => (
          <span
            key={childKeys[index]}
            role="tab"
            aria-selected={index === activeStep}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              index === activeStep ? "w-5 bg-amber-500" : "w-1.5 bg-zinc-600",
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={rotatePrevious}>
          Previous
        </Button>
        <Button type="button" size="sm" onClick={rotateNext}>
          Next card
        </Button>
      </div>
    </div>
  );
}
