import { supabaseAdmin } from '@/lib/supabase'
import { User, UserInsert, UserUpdate } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Error fetching user by ID:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }
  
  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error fetching user by email:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getUserByEmail:', error)
      return null
    }
  }
  
  /**
   * Create a new user
   */
  static async createUser(userData: Omit<UserInsert, 'password'> & { password: string }): Promise<User | null> {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      const userToInsert: UserInsert = {
        ...userData,
        password: hashedPassword,
        email_verified: false,
        whatsapp_verified: false
      }
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(userToInsert)
        .select()
        .single()
      
      if (error) {
        console.error('Error creating user:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in createUser:', error)
      return null
    }
  }
  
  /**
   * Update user
   */
  static async updateUser(id: string, updates: UserUpdate): Promise<User | null> {
    try {
      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 12)
      }
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating user:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in updateUser:', error)
      return null
    }
  }
  
  /**
   * Verify user password
   */
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email)
      if (!user) {
        return null
      }
      
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return null
      }
      
      return user
    } catch (error) {
      console.error('Error in verifyPassword:', error)
      return null
    }
  }
  
  /**
   * Update WhatsApp verification status
   */
  static async updateWhatsAppVerification(id: string, verified: boolean): Promise<User | null> {
    try {
      const updates: UserUpdate = {
        whatsapp_verified: verified,
        updated_at: new Date().toISOString()
      }
      
      if (verified) {
        updates.whatsapp_verified_at = new Date().toISOString()
      }
      
      return await this.updateUser(id, updates)
    } catch (error) {
      console.error('Error in updateWhatsAppVerification:', error)
      return null
    }
  }
  
  /**
   * Update email verification status
   */
  static async updateEmailVerification(id: string, verified: boolean): Promise<User | null> {
    try {
      return await this.updateUser(id, {
        email_verified: verified
      })
    } catch (error) {
      console.error('Error in updateEmailVerification:', error)
      return null
    }
  }
  
  /**
   * Get users by role
   */
  static async getUsersByRole(role: 'pelamar_kerja' | 'pencari_kandidat'): Promise<User[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching users by role:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getUsersByRole:', error)
      return []
    }
  }
  
  /**
   * Delete user (soft delete by updating status)
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting user:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in deleteUser:', error)
      return false
    }
  }
}