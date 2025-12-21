// app/(public)/components/Header.tsx
"use client";

import Link from "next/link";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";
import Image from "next/image";
import { Truck } from "lucide-react";
import { usePathname } from "next/navigation";

// Navigation links configuration
const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/#categories", label: "Categories" },
    { href: "/services", label: "Services" },
]

export default function Header() {
    const pathname = usePathname();

    return (
        <>
            {/* Top Banner - Scrolls with page */}
            <div className="w-full bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] py-2">
                <div className="container mx-auto px-4">
                    <p className="text-sm text-gray-800 text-center font-medium flex items-center justify-center gap-2">
                        <Truck className="w-4 h-4" />
                        Free shipping for orders over <span className="font-bold text-[#800020]">₦1,000,000</span>
                    </p>
                </div>
            </div>

            {/* Fixed Main Header */}
            <header className="sticky top-0 z-50 bg-[#faf9f6] border-b border-[#f7e7ce] shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Logo Section with Image */}
                        <div className="w-full md:w-auto flex items-center justify-between md:justify-start">
                            <Link
                                href="/"
                                className="flex items-center gap-3 group"
                            >
                                {/* Logo Image */}
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-[#f7e7ce] shadow-sm flex items-center justify-center bg-white">
                                    <Image
                                        src="/images/logo1.png"
                                        alt="HairStop Logo"
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Brand Name */}
                                <div className="flex flex-col">
                                    <span className="text-xl md:text-2xl font-bold tracking-tight text-[#800020] group-hover:text-[#b76e79] transition-colors duration-300">
                                        HairStop<span className="text-[#b76e79]">.</span>
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium -mt-1">Premium Hair Store</span>
                                </div>
                            </Link>

                            {/* Mobile: Cart & User Menu */}
                            <div className="flex items-center space-x-4 md:hidden">
                                <CartButton />
                                <UserMenu />
                            </div>
                        </div>

                        {/* Main Navigation */}
                        <nav className="w-full md:w-auto">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8">
                                {/* Navigation Links - Using array.map */}
                                <div className="flex items-center justify-center bg-[#f7e7ce] md:bg-transparent rounded-xl p-2 md:p-0 shadow-sm md:shadow-none w-full md:w-auto">
                                    <div className="flex items-center justify-evenly md:justify-center w-full gap-0.5 md:gap-4">
                                        {navLinks.map((link, index) => {
                                            // Improved isActive logic - matches exact path OR starts with path (for nested routes)
                                            const isActive = pathname === link.href ||
                                                (link.href !== '/' && pathname.startsWith(link.href));

                                            return (
                                                <div key={link.href} className="flex items-center">
                                                    <Link
                                                        href={link.href}
                                                        className={`
                                    px-2 py-2.5 md:px-0 md:py-1 font-medium rounded-lg transition-all 
                                    duration-300 text-center group relative text-[16px] lg:text-[17.5px] 
                                    whitespace-nowrap
                                    ${isActive
                                                                ? 'text-[#800020] font-bold underline decoration-2 decoration-[#b76e79] underline-offset-4'
                                                                : 'text-gray-800 hover:text-[#800020] hover:bg-[#f5c8c8] active:bg-[#f5c8c8] md:hover:bg-transparent'
                                                            }
                                `}
                                                    >
                                                        <span className="relative z-10">{link.label}</span>
                                                        <span className={`absolute inset-0 bg-[#f5c8c8] rounded-lg transition-opacity duration-300 z-0 
                                    ${isActive ? 'opacity-20' : 'opacity-0 group-hover:opacity-100'}`}></span>
                                                    </Link>

                                                    {/* Rose gold separator (hidden on mobile) */}
                                                    {index < navLinks.length - 1 && (
                                                        <span className="hidden md:inline-block text-[#b76e79] mx-2 opacity-50">•</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Desktop: Cart & User Menu */}
                                <div className="hidden md:flex items-center space-x-6 border-l border-[#f7e7ce] pl-8">
                                    <CartButton />
                                    <UserMenu />
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>
        </>
    )
}