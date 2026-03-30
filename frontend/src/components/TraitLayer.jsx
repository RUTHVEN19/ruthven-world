export default function TraitLayer({ category, isSelected, onSelect }) {
  return (
    <div className={`border rounded-lg p-3 cursor-pointer transition-all ${
      isSelected ? 'border-white bg-white/10' : 'border-gray-700 hover:border-gray-600'
    }`}
    onClick={() => onSelect(category.id)}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{category.name}</h4>
        <span className="text-xs text-gray-500">{category.values?.length || 0} values</span>
      </div>
    </div>
  );
}
