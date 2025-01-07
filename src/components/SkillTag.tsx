type SkillTagProps = {
    skill: string;
    variant: 'technical' | 'soft' | 'missing';
  }
  
  const variantStyles = {
    technical: 'bg-blue-100 text-blue-800',
    soft: 'bg-green-100 text-green-800',
    missing: 'bg-red-100 text-red-800'
  }
  
  export function SkillTag({ skill, variant }: SkillTagProps) {
    return (
      <span className={`px-3 py-1 rounded-full text-sm ${variantStyles[variant]}`}>
        {skill}
      </span>
    )
  }

