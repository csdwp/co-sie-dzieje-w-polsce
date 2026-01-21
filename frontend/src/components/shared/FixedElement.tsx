import ReactDOM from 'react-dom';

const FixedElement = () => {
  return ReactDOM.createPortal(
    <div
      className="fixed pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
       z-[1000] w-[calc(92%-64px)] sm:w-[calc(80%-64px)] h-11/12 sm:h-4/5 !max-w-[calc(1000px-64px)] !max-h-[800px] rounded-3xl
       before:content-[''] before:absolute before:top-[2px] before:left-0 before:w-full before:h-1/20
       before:bg-gradient-to-b before:from-background before:to-transparent
       after:content-[''] after:absolute after:bottom-[2px] after:left-0 after:w-full after:h-1/20 
       after:bg-gradient-to-t after:from-background after:to-transparent"
    />,
    document.body
  );
};

export default FixedElement;
