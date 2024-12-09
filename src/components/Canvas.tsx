import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";

const Canvas = forwardRef<HTMLCanvasElement>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000"); // 기본 색상
  const [lineWidth, setLineWidth] = useState(2); // 기본 선 굵기

  useImperativeHandle(ref, () => {
    if (canvasRef.current) {
      return canvasRef.current;
    }
    throw new Error("Canvas not initialized");
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // 초기 설정
    context.lineCap = "round";

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
      const x =
        "touches" in event
          ? event.touches[0].clientX - rect.left
          : event.clientX - rect.left;
      const y =
        "touches" in event
          ? event.touches[0].clientY - rect.top
          : event.clientY - rect.top;

      context.strokeStyle = color; // 현재 선택된 색상 사용
      context.lineWidth = lineWidth; // 현재 선 굵기 사용
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
    };

    // 이벤트 리스너 추가
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchend", endDrawing);
    canvas.addEventListener("touchmove", draw, { passive: false });

    // 이벤트 리스너 제거
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", endDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchend", endDrawing);
      canvas.removeEventListener("touchmove", draw);
    };
  }, [isDrawing, color, lineWidth]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setLineWidth(2); // 색상 변경 시 기본 선 굵기로 설정
  };

  const handleEraser = () => {
    setColor("#FFFFFF"); // 지우개는 흰색으로 설정
    setLineWidth(10); // 지우개 사용 시 더 큰 선 굵기 설정
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
        <button
          onClick={() => handleColorChange("#FF0000")}
          className={`w-8 h-8 bg-red-500 rounded-full ${
            color === "#FF0000" ? "border-2 border-[#FF4B4B]" : ""
          }`}
        ></button>
        <button
          onClick={() => handleColorChange("#00FF00")}
          className={`w-8 h-8 bg-green-500 rounded-full ${
            color === "#00FF00" ? "border-2 border-[#FF4B4B]" : ""
          }`}
        ></button>
        <button
          onClick={() => handleColorChange("#0000FF")}
          className={`w-8 h-8 bg-blue-500 rounded-full ${
            color === "#0000FF" ? "border-2 border-[#FF4B4B]" : ""
          }`}
        ></button>
        <button
          onClick={() => handleColorChange("#FFFF00")}
          className={`w-8 h-8 bg-yellow-500 rounded-full ${
            color === "#FFFF00" ? "border-2 border-[#FF4B4B]" : ""
          }`}
        ></button>
        <button
          onClick={() => handleColorChange("#000000")}
          className={`w-8 h-8 bg-black rounded-full ${
            color === "#000000" ? "border-2 border-[#FF4B4B]" : ""
          }`}
        ></button>
        <button
          onClick={handleEraser}
          className={`w-8 h-8 ${
            color === "#FFFFFF" ? "border-2 border-[#FF4B4B]" : ""
          }`}
        >
          <Image src="/images/eraser.png" alt="지우개" width={32} height={32} />
        </button>
      </div>
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;
