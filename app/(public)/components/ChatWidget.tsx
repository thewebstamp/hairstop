//app/(public)/components/ChatWidget.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as Dialog from '@radix-ui/react-dialog';

type Message = {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Hi there! I'm your Hair Stop assistant. 💁🏾‍♀️ I can help you with product info, shipping, our services, or anything else about our luxury hair collection. How can I assist you today?",
            role: 'assistant',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check Ollama status on component mount
    useEffect(() => {
        checkOllamaStatus();
    }, []);

    const checkOllamaStatus = async () => {
        try {
            const response = await fetch('/api/chat/free');
            const data = await response.json();
            setOllamaStatus(data.status === 'connected' ? 'connected' : 'disconnected');
        } catch {
            setOllamaStatus('disconnected');
        }
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input.trim(),
            role: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Get conversation history excluding the initial greeting
            const conversationHistory = messages
                .filter(msg => msg.id !== '1') // Exclude initial greeting
                .slice(-4) // Last 2 exchanges (4 messages)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            console.log('Sending conversation history:', conversationHistory);

            const response = await fetch('/api/chat/free', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input.trim(),
                    conversation: conversationHistory
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            console.log('Received response source:', data.source);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.response,
                role: 'assistant',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Re-check Ollama status if we got a fallback
            if (data.source === 'fallback') {
                await checkOllamaStatus();
            }
        } catch (error) {
            console.error('Error in chat:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `I apologize, I'm having technical issues. ${ollamaStatus === 'disconnected'
                        ? "It seems my AI brain isn't running. Please make sure Ollama is installed and running on your computer, or contact support."
                        : "Please try again in a moment."
                    }`,
                role: 'assistant',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-linear-to-r from-purple-600 to-pink-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                aria-label="Open chat with Ada"
            >
                <MessageCircle className="w-7 h-7 text-white" />
                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs text-white flex items-center justify-center ${ollamaStatus === 'connected' ? 'bg-green-500' :
                        ollamaStatus === 'disconnected' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}>
                    {ollamaStatus === 'connected' ? '✓' :
                        ollamaStatus === 'disconnected' ? '!' : '?'}
                </span>
            </button>

            {/* Chat Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                    <Dialog.Content className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-100 h-[90vh] md:h-150 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="bg-linear-to-r from-purple-600 to-pink-500 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Dialog.Title className="font-bold text-lg">Hair Stop Assistant</Dialog.Title>
                                        <Dialog.Description className="text-sm text-white/90">
                                            {ollamaStatus === 'connected' ? 'AI Assistant Ready 💁🏾‍♀️' :
                                                ollamaStatus === 'disconnected' ? 'Basic Mode (AI Offline)' :
                                                    'Checking AI status...'}
                                        </Dialog.Description>
                                    </div>
                                </div>
                                <Dialog.Close asChild>
                                    <button className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </Dialog.Close>
                            </div>
                        </div>

                        {/* Status Banner */}
                        {ollamaStatus === 'disconnected' && (
                            <div className="bg-yellow-50 border-b border-yellow-200 p-3 text-sm text-yellow-800">
                                <p className="font-medium">⚠️ Local AI Not Running</p>
                                <p className="text-xs mt-1">
                                    Install and run <a href="https://ollama.ai" target="_blank" className="underline">Ollama</a> for smart responses.
                                    Currently using basic fallback mode.
                                </p>
                            </div>
                        )}

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center shrink-0 mt-1">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-3 max-w-[80%] ${message.role === 'user'
                                                ? 'bg-linear-to-r from-purple-500 to-pink-400 text-white ml-auto'
                                                : 'bg-white border border-gray-200'
                                                }`}
                                        >
                                            {message.role === 'assistant' ? (
                                                <ReactMarkdown>
                                                    {message.content}
                                                </ReactMarkdown>
                                            ) : (
                                                <p>{message.content}</p>
                                            )}
                                            <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                                                <User className="w-4 h-4 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                            <span className="text-gray-600">thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        ollamaStatus === 'connected'
                                            ? "Ask me about our hair, shipping, or services..."
                                            : "AI is offline. Using basic responses..."
                                    }
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="bg-linear-to-r from-purple-600 to-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                {ollamaStatus === 'connected'
                                    ? "Powered by Local AI 💁🏾‍♀️"
                                    : "Install Ollama for smarter responses. Basic mode active."}
                            </p>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}