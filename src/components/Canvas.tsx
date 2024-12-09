import { useRef, useState, useEffect } from 'react';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // 초기 설정
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#000000';

    const startDrawing = (event: MouseEvent | TouchEvent) => {
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

      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
    };

    // 이벤트 리스너 추가
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', endDrawing);
    canvas.addEventListener('touchmove', draw);

    // 이벤트 리스너 제거
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', endDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchend', endDrawing);
      canvas.removeEventListener('touchmove', draw);
    };
  }, [isDrawing]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full h-full"
      />
    </div>
  );
} 