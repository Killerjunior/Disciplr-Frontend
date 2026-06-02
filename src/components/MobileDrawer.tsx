import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { WalletConnectButton } from './Wallet/WalletConnectButton';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-backdrop" onClick={onClose} aria-hidden="true">
      <FocusTrap>
        <nav
          className="mobile-drawer"
          role="dialog"
          aria-modal="true"
          id="mobile-drawer"
          ref={drawerRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="mobile-drawer-close" onClick={onClose} aria-label="Close navigation drawer">
            <X size={24} />
          </button>
          <Link to="/" className="mobile-drawer-link" onClick={onClose}>
            Home
          </Link>
          <Link to="/transactions" className="mobile-drawer-link" onClick={onClose}>
            Transactions
          </Link>
          <Link to="/analytics" className="mobile-drawer-link" onClick={onClose}>
            Analytics
          </Link>
          <Link to="/vaults/create" className="mobile-drawer-link" onClick={onClose}>
            Create Vault
          </Link>
          <WalletConnectButton />
        </nav>
      </FocusTrap>
    </div>
  );
}
