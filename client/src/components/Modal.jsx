export default function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <button onClick={onClose} className="float-right font-bold text-red-500">X</button>
        {children}
      </div>
    </div>
  );
}
