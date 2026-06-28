import { createPortal } from 'react-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../organisms/Navbar/Navbar';
import Footer from '../organisms/Footer/Footer';
import CartSidebar from '../organisms/CartSidebar/CartSidebar';

const MainLayout = ({ children, cartCount, isLoggedIn }) => {
  return (
    <>
      <Navbar cartCount={cartCount} isLoggedIn={isLoggedIn} />
      <main className="relative z-0" style={{ pointerEvents: "auto" }}>{children}</main>
      <Footer />
      <CartSidebar />
      {createPortal(
        <Toaster
          position="top-center"
          containerStyle={{ top: '80px', zIndex: 99999 }}
          toastOptions={{ style: { fontFamily: 'inherit' } }}
        />,
        document.body
      )}
    </>
  );
};

export default MainLayout;
