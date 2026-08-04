import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: rooms, error } = await supabase
    .from('Room') // Or whatever the table is called in Prisma it's usually 'Room' but maybe uppercase
    .select('id, contentName, basePrice, status')
    
  if (error) {
    console.error(error)
    return
  }
  console.log(JSON.stringify(rooms, null, 2))
}

main()
