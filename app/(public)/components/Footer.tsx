// app/(public)/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Mail, Phone, Shield, Truck, Building } from "lucide-react";
import { getCategories } from "@/lib/data"; // Import your existing function

export default async function Footer() {
    const currentYear = new Date().getFullYear();

    // Fetch categories using your existing function
    const categories = await getCategories();

    const socialLinks = [
        { icon: <Instagram className="w-5 h-5" />, label: "Instagram", href: "https://instagram.com" },
        { icon: <Facebook className="w-5 h-5" />, label: "Facebook", href: "https://facebook.com" },
    ];

    return (
        <footer className="bg-[#faf9f6] border-t border-[#f7e7ce] mt-0">
            <div className="bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] py-1"></div>
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 place-items-center gap-8 lg:gap-12">
                    {/* Brand Column - Centered on mobile */}
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:justify-center lg:justify-start lg:items-start gap-3">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#f7e7ce] shadow-sm flex items-center justify-center bg-white">
                                <Image
                                    src="/images/logo1.png"
                                    alt="HairStop Logo"
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#800020]">HairStop</h3>
                                <p className="text-sm text-gray-600">Premium Hair Store</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed md:px-12 lg:mx-0">
                            Your destination for luxury, 100% human hair extensions and premium hair care.
                            We bring elegance and quality to every strand.
                        </p>
                        <div className="flex items-center justify-center md:justify-start  md:px-12 lg:mx-0 gap-4 pt-2">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white border border-[#f7e7ce] flex items-center justify-center text-gray-600 hover:bg-[#f5c8c8] hover:text-[#800020] transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Categories Column - Centered on mobile */}
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-semibold text-[#800020] mb-6 pb-2 border-b border-[#f7e7ce]">
                            Shop Categories
                        </h4>
                        <ul className="space-y-3">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        href={`/shop?category=${category.slug}`}
                                        className="text-gray-600 hover:text-[#800020] transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-[#b76e79] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Column - Centered on mobile */}
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-semibold text-[#800020] mb-6 pb-2 border-b border-[#f7e7ce]">
                            Support
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                {/* <Link
                                    href="/contact"
                                    className="text-gray-600 hover:text-[#800020] transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group"
                                > */}
                                <div className="text-gray-600 hover:text-[#800020] transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-[#b76e79] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Contact Us
                                </div>
                                {/* </Link> */}
                            </li>
                            <li>
                                {/* <Link
                                    href="/privacy"
                                    className="text-gray-600 hover:text-[#800020] transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group"
                                > */}
                                <div className="text-gray-600 hover:text-[#800020] transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-[#b76e79] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Privacy Policy
                                </div>
                                {/* </Link> */}
                            </li>
                            <li>
                                {/* <Link
                                    href="/terms"
                                    className="text-gray-600 hover:text-[#800020] transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group"
                                > */}
                                <div className="text-gray-600 hover:text-[#800020] transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-[#b76e79] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Terms of Service
                                </div>
                                {/* </Link> */}
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Payment Column - Centered on mobile */}
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-semibold text-[#800020] mb-6 pb-2 border-b border-[#f7e7ce]">
                            Contact & Payment
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex flex-col md:flex-row md:items-start items-center gap-3">
                                <Phone className="w-5 h-5 text-[#b76e79] mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Customer Service</p>
                                    <p className="text-gray-600 text-sm">+234 903 698 1564</p>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row md:items-start items-center gap-3">
                                <Mail className="w-5 h-5 text-[#b76e79] mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Email</p>
                                    <p className="text-gray-600 text-sm">hairstop.ng@gmail.com</p>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row md:items-start items-center gap-3">
                                <Building className="w-5 h-5 text-[#b76e79] mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Bank Transfer</p>
                                    <p className="text-gray-600 text-sm">Secure & Direct Payments</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Trust Badges - Centered on mobile */}
                <div className="mt-12 pt-8 border-t border-[#f7e7ce]">
                    <div className="flex flex-col items-center gap-6">
                        <h3 className="text-lg font-semibold text-[#800020]">Trusted Features</h3>

                        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                            {/* Security */}
                            <div className="flex flex-col items-center text-center p-3">
                                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center mb-2 shadow-inner">
                                    <Shield className="w-6 h-6 text-[#800020]" />
                                </div>
                                <span className="text-sm font-medium text-[#800020]">100% Secure</span>
                                <span className="text-xs text-gray-500 hidden md:block mt-1">Protected</span>
                            </div>

                            {/* Bank Transfer */}
                            <div className="flex flex-col items-center text-center p-3">
                                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center mb-2 shadow-inner">
                                    <Building className="w-6 h-6 text-[#800020]" />
                                </div>
                                <span className="text-sm font-medium text-[#800020]">Bank Transfer</span>
                                <span className="text-xs text-gray-500 hidden md:block mt-1">Secure Payment</span>
                            </div>

                            {/* Delivery */}
                            <div className="flex flex-col items-center text-center p-3">
                                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#f7e7ce] to-[#f5c8c8] flex items-center justify-center mb-2 shadow-inner">
                                    <Truck className="w-6 h-6 text-[#800020]" />
                                </div>
                                <span className="text-sm font-medium text-[#800020]">Nationwide</span>
                                <span className="text-xs text-gray-500 hidden md:block mt-1">Fast Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar - Centered on mobile */}
            <div className="bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <p className="text-gray-800 font-medium">
                            © {currentYear} HairStop. All rights reserved.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
                            {/* <Link href="/privacy" className="hover:text-[#800020] transition-colors font-medium"> */}
                            <div className="hover:text-[#800020] transition-colors font-medium">
                                Privacy Policy
                            </div>
                            {/* </Link> */}
                            <span className="w-1 h-1 bg-[#b76e79] rounded-full hidden md:inline"></span>
                            {/* <Link href="/terms" className="hover:text-[#800020] transition-colors font-medium"> */}
                            <div className="hover:text-[#800020] transition-colors font-medium">
                                Terms of Service
                            </div>
                            {/* </Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}