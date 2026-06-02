import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export default function NavLink({ to, className = '', children, ariaLabel }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const combinedClass = `${className} ${isActive ? 'active' : ''}`.trim();
  return (
    <Link to={to} className={combinedClass} aria-label={ariaLabel} aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  );
}
