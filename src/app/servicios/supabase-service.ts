import { Service } from "@angular/core"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

@Service()
export class SupabaseService {
  private urlSupabase: string = "https://uypcasucqtppmzhqpyzg.supabase.co"
  private llaveSupabase: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cGNhc3VjcXRwcG16aHFweXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTYyMDMsImV4cCI6MjEwNDA5MjIwM30.VmzW-z71Gv-ZqRThG5mYdYs3TjGeYPY2JUr3FtDPWDA"
  cliente: SupabaseClient = createClient(this.urlSupabase, this.llaveSupabase)
}