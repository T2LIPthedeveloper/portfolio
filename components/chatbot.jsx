"use client";

import React, { useState, useEffect, useRef } from "react";
import { Client } from "@gradio/client";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hi, I'm Atul's chatbot! Talk to me to learn more about Atul's work.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef(null);
  const gradioToken = process.env.NEXT_PUBLIC_GRADIO_API_KEY;

  useEffect(() => {
    // Initialize the Gradio client when component mounts
    const initClient = async () => {
      try {
        clientRef.current = await Client.connect(
          "atulisoffline/Portfolio-Chatbot",
          { hf_token: gradioToken }
        );
      } catch (error) {
        console.error("Failed to connect to Gradio API:", error);
      }
    };

    initClient();

    // Cleanup function
    return () => {
      clientRef.current = null;
    };
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      // Add user message to chat
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      const userInput = input;
      setInput("");
      setIsLoading(true);

    try {
      if (!clientRef.current) {
        throw new Error("Gradio client not initialized");
      }

      // Add placeholder message
      setMessages((prev) => [...prev, { text: "Thinking...", sender: "bot" }]);

      // Generate message history for context
      const messageHistory = messages.map((m) => m.text).join("\n");

      // Call the Gradio API
      const result = await clientRef.current.predict("/chat", {
        message: userInput,
        system_message: messageHistory,
      });

      // Remove placeholder message
      setMessages((prev) => prev.filter((m) => m.text !== "Thinking..."));

      // Add bot response to chat
      const botResponse =
        result.data || "Sorry, I couldn't process that request.";
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Error calling Gradio API:", error);
      setMessages((prev) => [
        ...prev.filter((m) => m.text !== "Thinking..."),
        {
        text: "Sorry, there was an error processing your request.",
        sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

return (
    <div data-section id="chat" className="flex flex-col h-full pt-16">
        <div className="hero-section flex flex-col justify-center items-center text-center py-20 space-y-4">
            <h1 className="text-5xl subpixel-antialiased tracking-wide">
                Chat with me!
            </h1>
            <h2 className="text-surface-600 pt-2 text-base font-normal tracking-wider">
                Ask me anything about Atul and his work.
            </h2>
        </div>
        <div className="flex-1 flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar max-h-[40vh]">
                <div className="flex flex-col">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-2 max-w-xs ${
                                message.sender === "user"
                                    ? "self-end ml-auto text-right"
                                    : "self-start mr-auto text-left"
                            }`}
                        >
                            <div
                                className={`p-2 inline-block rounded ${
                                    message.sender === "user"
                                        ? "bg-primary-500 text-surface-100"
                                        : "bg-surface-300 text-white"
                                }`}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
        <div className="flex items-center mt-4">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow p-2 border border-surface-300 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-surface-200 text-surface-600 placeholder-surface-500"
                placeholder="Type a message..."
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading}
                className={`ml-2 p-2 bg-primary-500 text-surface-100 font-bold rounded transition duration-300 ${
                    isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-primary-600"
                }`}
            >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
            </button>
        </div>
    </div>
);
};

export default Chatbot;
