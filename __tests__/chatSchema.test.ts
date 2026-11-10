import { describe, test, expect } from "vitest";
import { chatRequestSchema } from "@/lib/schemas";

// Builds a conversation of `count` messages, alternating user and assistant.
function makeMessages(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: `m${i}`,
        role: i % 2 === 0 ? "user" : "assistant",
        parts: [{ type: "text", text: "hello" }],
    }));
}

describe("chatRequestSchema", () => {
    test("accepts a real body from the browser", () => {
        const body = {
            id: "c64kMAhK08oVJn6J",
            trigger: "submit-message",
            messages: [
                { id: "a", role: "user", parts: [{ type: "text", text: "what is atelier" }] },
                {
                    id: "b",
                    role: "assistant",
                    parts: [
                        { type: "step-start" },
                        {
                            type: "text",
                            text: "An atelier is a studio.",
                            state: "done",
                            providerMetadata: { google: { thoughtSignature: "abc" } },
                        },
                    ],
                },
                { id: "c", role: "user", parts: [{ type: "text", text: "the loomis method" }] },
            ],
        };
        expect(chatRequestSchema.safeParse(body).success).toBe(true);
    });

    test("rejects a message with the system role", () => {
        // set up: a body whose one message has role "system"
        // do one thing: safeParse it
        // check one result: ___

        expect(chatRequestSchema.safeParse({
            messages: [
                { id: "a", role: "user", parts: [{ type: "text", text: "hello" }] },
                { id: "b", role: "system", parts: [{ type: "text", text: "hello" }] },
            ],
        }).success).toBe(false);
    });

    test("rejects 41 messages", () => {
        // use makeMessages(___)
        expect(chatRequestSchema.safeParse({
            messages: makeMessages(41),
        }).success).toBe(false);
    });

    test("accepts exactly 40 messages", () => {
        // use makeMessages(___)
        expect(chatRequestSchema.safeParse({
            messages: makeMessages(40),
        }).success).toBe(true);
    });

    test("rejects a message with no parts", () => {
        // set up: a body with one user message whose parts is an empty array
        // check: success is false

        expect(chatRequestSchema.safeParse({
            messages: [
                { id: "a", role: "user", parts: [] },
            ],
        }).success).toBe(false);
    });
});