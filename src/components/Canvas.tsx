import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000'); // 기본 색상

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // 초기 설정
    context.lineWidth = 2;
    context.lineCap = 'round';

    const startDrawing = (event: MouseEvent | TouchEvent) => {
      event.preventDefault(); // 기본 동작 방지
      setIsDrawing(true);
      draw(event);
    };

    const endDrawing = () => {
      setIsDrawing(false);
      context.beginPath();
    };

    const draw = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;

      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
      const y = 'touches' in event ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

      context.strokeStyle = color; // 현재 선택된 색상 사용
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
    };

    // 이벤트 리스너 추가
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchend', endDrawing);
    canvas.addEventListener('touchmove', draw, { passive: false });

    // 이벤트 리스너 제거
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', endDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchend', endDrawing);
      canvas.removeEventListener('touchmove', draw);
    };
  }, [isDrawing, color]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  const handleEraser = () => {
    setColor('#FFFFFF'); // 지우개는 흰색으로 설정
  };

  return (
    <div>
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-2">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-full"
        />
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8" style={{ backgroundColor: color, border: '2px solid #000' }}></div>
        <button onClick={() => handleColorChange('#FF0000')} className="w-8 h-8 bg-red-500 rounded-full"></button>
        <button onClick={() => handleColorChange('#00FF00')} className="w-8 h-8 bg-green-500 rounded-full"></button>
        <button onClick={() => handleColorChange('#0000FF')} className="w-8 h-8 bg-blue-500 rounded-full"></button>
        <button onClick={() => handleColorChange('#FFFF00')} className="w-8 h-8 bg-yellow-500 rounded-full"></button>
        <button onClick={() => handleColorChange('#000000')} className="w-8 h-8 bg-black rounded-full"></button>
        <button onClick={handleEraser} className="w-8 h-8">
          <Image src="/images/eraser.png" alt="지우개" width={32} height={32} />
        </button>
      </div>
    </div>
  );
} 