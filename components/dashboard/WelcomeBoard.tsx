import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function WelcomeBoard() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white h-full relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />

            <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                    반갑습니다, 대표님! 👋
                </h2>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    좌측 메뉴에서 원하는 도구를 선택하여 작업을 시작하세요.<br />
                    <strong>아카데미웹</strong>은 학원 운영 효율화를 위한 최고의 파트너입니다.
                </p>

                <div className="flex justify-center gap-4">
                    {/* Buttons removed as per request */}
                </div>
            </div>
        </div>
    );
}
