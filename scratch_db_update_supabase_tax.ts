import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  // Update Master Suite (5405 / 1.15 = 4700)
  const { data: d1, error: e1 } = await supabase
    .from('Room')
    .update({ basePrice: 4700 })
    .eq('id', 'ad5de85a-4789-4092-b6e6-ab6ba0324cf1')
    .select()
    
  if (e1) console.error("Error updating Master Suite:", e1)
  else console.log("Updated Master Suite:", d1)

  // Update Habitacion Doble Familiar (4830 / 1.15 = 4200)
  const { data: d2, error: e2 } = await supabase
    .from('Room')
    .update({ basePrice: 4200 })
    .eq('id', 'e938132f-0bed-40bb-911c-7d42ade59315')
    .select()

  if (e2) console.error("Error updating Doble Familiar:", e2)
  else console.log("Updated Doble Familiar:", d2)
}

main()
