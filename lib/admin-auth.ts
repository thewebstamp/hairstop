// lib/admin-auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function verifyAdmin() {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { 
        success: false, 
        error: 'Unauthorized - No session found' 
      };
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return { 
        success: false, 
        error: 'Forbidden - Admin access required' 
      };
    }
    
    return { 
      success: true, 
      user: session.user 
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { 
      success: false, 
      error: 'Internal server error' 
    };
  }
}