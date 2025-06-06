"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ConsultantCardProps } from "@/app/type";
import TypingText from "./typing-text";

const ConsultantCard: React.FC<ConsultantCardProps> = ({
  consultant,
  evaluation,
}) => {
  return (
    <Card className="flex flex-col h-full border-4 border-orange-500 hover:scale-105 transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="text-lg">{consultant.name}</CardTitle>
        <p className="text-sm text-gray-600">
          {consultant.role} &middot; {consultant.location}
        </p>
        <p className="text-xs text-gray-500">
          {consultant.yearsOfExp} yr{consultant.yearsOfExp > 1 ? "s" : ""} exp
        </p>
        {consultant.skills && consultant.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {consultant.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-orange-50 text-gray-800 border border-orange-500 text-xs px-2 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col flex-grow">
        <p className="text-sm text-gray-700 mb-3">{consultant.bio}</p>

        {!evaluation ? (
          <p className="mt-auto text-gray-500 italic">Yet to be evaluated</p>
        ) : (
          <div className="mt-2 space-y-3 text-gray-700 overflow-auto">
            <div>
              <span className="font-medium text-orange-600">Fit Score:</span>{" "}
              <span className="font-semibold">{evaluation.fitScore}/100</span>
            </div>

            <div>
              <span className="font-medium">Summary:</span>
              {/* Wrap TypingText in a <p> is safe now, because TypingText returns a <span> */}
              <p className="ml-2">
                <TypingText text={evaluation.summary} speed={25} />
              </p>
            </div>

            <div>
              <span className="font-medium">Pros:</span>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {evaluation.pros.map((p, i) => (
                  <li key={i}>
                    {/* Each <li> can contain a <span> from TypingText */}
                    <TypingText text={p} speed={25} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-medium">Cons:</span>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {evaluation.cons.map((c, i) => (
                  <li key={i}>
                    <TypingText text={c} speed={25} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-medium">Questions:</span>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {evaluation.questions.map((q, i) => (
                  <li key={i}>
                    <TypingText text={q} speed={25} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(ConsultantCard);
