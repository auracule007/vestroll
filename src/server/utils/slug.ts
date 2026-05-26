
export function generateSlug(name: string): string {
  const slug = name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/[\s_]+/g, '-')   
    .replace(/-+/g, '-')        
    .replace(/^-+|-+$/g, '');   

  const randomSuffix = generateRandomSuffix(6);
  return `${slug}-${randomSuffix}`;
}


function generateRandomSuffix(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}
