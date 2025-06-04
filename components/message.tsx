"use client";

import type { Message as TMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useState } from "react";
import equal from "fast-deep-equal";
import Image from "next/image";

import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "./typing-indicator";
import {
  CheckCircle,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  PocketKnife,
  SparklesIcon,
  StopCircle,
} from "lucide-react";
import { SpinnerIcon } from "./icons";

interface ReasoningPart {
  type: "reasoning";
  reasoning: string;
  details: Array<{ type: "text"; text: string }>;
}

interface ReasoningMessagePartProps {
  part: ReasoningPart;
  isReasoning: boolean;
}

export function ReasoningMessagePart({
  part,
  isReasoning,
}: ReasoningMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: 0,
    },
  };

  const memoizedSetIsExpanded = useCallback((value: boolean) => {
    setIsExpanded(value);
  }, []);

  useEffect(() => {
    memoizedSetIsExpanded(isReasoning);
  }, [isReasoning, memoizedSetIsExpanded]);

  return (
    <div className="flex flex-col">
      {isReasoning ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoning</div>
          <div className="animate-spin">
            <SpinnerIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoned for a few seconds</div>
          <button
            className={cn(
              "cursor-pointer rounded-full dark:hover:bg-zinc-800 hover:bg-zinc-200",
              {
                "dark:bg-zinc-800 bg-zinc-200": isExpanded,
              },
            )}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reasoning"
            className="text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {part.details.map((detail, detailIndex) =>
              detail.type === "text" ? (
                <Markdown key={detailIndex}>{detail.text}</Markdown>
              ) : (
                "<redacted>"
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Message = memo(function Message({
  message,
  isLoading,
  isLatestMessage,
  status,
}: {
  message: TMessage;
  isLoading: boolean;
  isLatestMessage: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
}) {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const isAssistant = message.role === "assistant";

  useEffect(() => {
    if (isAssistant && isLatestMessage && status === "streaming") {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setDisplayedMessage(message.content);
      }, 4000); // 4 second typing delay
      return () => clearTimeout(timer);
    } else {
      setDisplayedMessage(message.content);
      setIsTyping(false);
    }
  }, [message.content, isAssistant, isLatestMessage, status]);

  const renderContent = () => {
    if (isTyping && isAssistant) {
      return <TypingIndicator />;
    }
    return <Markdown>{displayedMessage}</Markdown>;
  };

  return (
    <div
      className={cn(
        "w-full text-gray-800 dark:text-gray-100 flex flex-col space-y-2 py-4",
        isAssistant && "bg-secondary/30"
      )}
    >
      <div className="max-w-xl w-full mx-auto flex space-x-4">
        {isAssistant ? (
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 relative">
            <Image
              src="/Casinocroupier in zwart vest  jonge man met snor, klassieke casinolook.jpeg"
              alt="Roul Ette profiel"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">{renderContent()}</div>
      </div>
    </div>
  );
});

Message.displayName = "Message";

export { Message, type ReasoningPart };
