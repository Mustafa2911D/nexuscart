export default function ProductFilter({ search, setSearch, category, setCategory, categories }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row md:items-center md:justify-between">
      <input
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-xl border px-3 py-2 outline-none focus:border-primary md:max-w-sm"
        aria-label="Search products by name"
      />
      <div className="flex flex-wrap gap-2">
        <button onClick={()=>setCategory('All')} className={`rounded-full border px-3 py-1 text-sm ${category==='All'?'border-primary text-primary':'hover:border-primary'}`}>All</button>
        {categories.map((c)=> (
          <button key={c} onClick={()=>setCategory(c)} className={`rounded-full border px-3 py-1 text-sm ${category===c?'border-primary text-primary':'hover:border-primary'}`}>{c}</button>
        ))}
      </div>
    </div>
  )
}
