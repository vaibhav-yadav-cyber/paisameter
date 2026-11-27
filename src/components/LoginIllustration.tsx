import React from 'react';

export const LoginIllustration: React.FC = () => {
  return (
    <div className="w-full max-w-[560px] flex items-center justify-center select-none">
      <svg
        viewBox="0 0 720 560"
        className="w-full h-auto drop-shadow-sm overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal floor baseline */}
        <line
          x1="30"
          y1="465"
          x2="700"
          y2="465"
          stroke="#0F172A"
          strokeWidth="1.5"
          strokeOpacity="0.25"
        />

        {/* Minimalist Floor Lamp (Left) */}
        <g id="floor-lamp">
          {/* Base */}
          <path
            d="M95 465 L125 465"
            stroke="#0F172A"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Stem */}
          <line
            x1="110"
            y1="465"
            x2="110"
            y2="200"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Conical Lampshade */}
          <path
            d="M94 200 L126 200 L134 235 L86 235 Z"
            fill="#0F172A"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Window in Background (Right) */}
        <g id="window-frame">
          {/* Outer Frame */}
          <rect
            x="485"
            y="110"
            width="175"
            height="235"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="4"
          />
          {/* Vertical Middle Divider */}
          <line
            x1="572"
            y1="110"
            x2="572"
            y2="345"
            stroke="#0F172A"
            strokeWidth="3.5"
          />
          {/* Horizontal Dividers */}
          <line
            x1="485"
            y1="188"
            x2="660"
            y2="188"
            stroke="#0F172A"
            strokeWidth="3.5"
          />
          <line
            x1="485"
            y1="266"
            x2="660"
            y2="266"
            stroke="#0F172A"
            strokeWidth="3.5"
          />
        </g>

        {/* Potted Plant in Tall Vase (Far Right) */}
        <g id="potted-plant">
          {/* Bamboo / Plant Stalks */}
          <path
            d="M620 465 L620 370"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Leaves */}
          <path
            d="M620 370 C612 360, 600 365, 598 375 C608 378, 616 372, 620 370 Z"
            fill="#34D399"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <path
            d="M620 380 C628 370, 642 375, 644 385 C634 388, 624 382, 620 380 Z"
            fill="#10B981"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <path
            d="M620 395 C610 385, 598 390, 596 400 C608 403, 616 397, 620 395 Z"
            fill="#34D399"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <path
            d="M620 405 C628 395, 642 400, 645 410 C635 413, 625 407, 620 405 Z"
            fill="#10B981"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <path
            d="M620 420 C610 410, 598 415, 596 425 C608 428, 616 422, 620 420 Z"
            fill="#34D399"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <path
            d="M620 430 C628 420, 640 425, 643 435 C633 438, 624 432, 620 430 Z"
            fill="#10B981"
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* Tall Ceramic Vase */}
          <path
            d="M610 438 L630 438 L633 465 L607 465 Z"
            fill="#0F172A"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>

        {/* Emerald Circular Rug */}
        <ellipse
          cx="440"
          cy="465"
          rx="175"
          ry="38"
          fill="#D1FAE5"
          opacity="0.85"
        />

        {/* Steaming Coffee Cup on Rug */}
        <g id="coffee-cup">
          {/* Mug */}
          <path
            d="M485 450 L487 468 C487 472, 503 472, 503 468 L505 450 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Handle */}
          <path
            d="M504 454 C509 454, 510 464, 503 465"
            stroke="#0F172A"
            strokeWidth="2"
            fill="none"
          />
          {/* Steam Lines */}
          <path
            d="M492 444 C490 440, 494 436, 492 432"
            stroke="#0F172A"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M497 445 C495 441, 499 437, 497 430"
            stroke="#0F172A"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M502 444 C500 440, 504 436, 502 432"
            stroke="#0F172A"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Emerald Green Armchair / Beanbag Chair */}
        <g id="armchair">
          {/* Main beanbag body */}
          <path
            d="M380 445 C345 440, 340 370, 360 330 C370 310, 400 300, 430 305 C475 315, 515 365, 505 425 C500 455, 455 455, 380 445 Z"
            fill="#10B981"
            stroke="#0F172A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Chair fold lines for depth */}
          <path
            d="M395 350 C410 380, 440 395, 475 390"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M380 390 C400 420, 435 430, 470 425"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Character Sitting in Armchair */}
        <g id="character">
          {/* Right Leg (Behind) */}
          <path
            d="M420 375 L450 435 L440 480"
            stroke="#0F172A"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M420 375 L450 435 L440 480"
            stroke="#94A3B8"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Shoe */}
          <path
            d="M430 475 L455 488 C460 490, 455 498, 445 498 L430 493 Z"
            fill="#0F172A"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M440 495 L454 492"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Left Leg (Crossing forward in perspective) */}
          <path
            d="M400 375 L350 395 L310 445"
            stroke="#0F172A"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M400 375 L350 395 L310 445"
            stroke="#94A3B8"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Shoe (angled upward) */}
          <path
            d="M312 442 L285 452 L310 476 L324 455 Z"
            fill="#0F172A"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* White sole */}
          <path
            d="M285 452 L310 476"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Torso / Shirt */}
          <path
            d="M410 325 C395 340, 390 380, 415 385 C440 390, 460 360, 455 330 Z"
            fill="#0F172A"
            stroke="#0F172A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* White Collar / V-neck detail */}
          <path
            d="M428 316 L432 328 L438 316"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />

          {/* Arms / Rolled Sleeves */}
          {/* Right Arm to Laptop */}
          <path
            d="M445 335 L455 365 L430 375"
            stroke="#0F172A"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M445 335 L455 365 L430 375"
            stroke="#F8FAFC"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left Arm to Laptop */}
          <path
            d="M410 335 L395 365 L415 375"
            stroke="#0F172A"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M410 335 L395 365 L415 375"
            stroke="#F8FAFC"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Laptop on Lap */}
          <g id="laptop">
            {/* Base */}
            <path
              d="M375 380 L445 380 L440 388 L370 388 Z"
              fill="#E2E8F0"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Screen */}
            <path
              d="M370 385 L350 325 L405 325 L405 382 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          {/* Head & Neck */}
          <path
            d="M430 310 L430 320"
            stroke="#0F172A"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Face */}
          <circle
            cx="430"
            cy="295"
            r="16"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="3"
          />
          {/* Round Glasses */}
          <circle
            cx="424"
            cy="295"
            r="5"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <circle
            cx="434"
            cy="295"
            r="5"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <line
            x1="429"
            y1="295"
            x2="430"
            y2="295"
            stroke="#0F172A"
            strokeWidth="2"
          />
          {/* Hair */}
          <path
            d="M415 292 C415 272, 440 270, 445 282 C450 285, 446 295, 442 295 C442 288, 435 282, 422 284 Z"
            fill="#0F172A"
            stroke="#0F172A"
            strokeWidth="2"
          />
        </g>

        {/* Connected Floating UI Widget (Finance Dashboard Card) */}
        <g id="floating-widget">
          {/* Connection Stem from Laptop */}
          <path
            d="M405 350 L485 305"
            stroke="#0F172A"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <polygon
            points="480,300 495,302 485,310"
            fill="#0F172A"
          />

          {/* Card Frame */}
          <rect
            x="485"
            y="275"
            width="85"
            height="50"
            rx="6"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
          {/* Top card bar */}
          <line
            x1="485"
            y1="285"
            x2="570"
            y2="285"
            stroke="#0F172A"
            strokeWidth="1.5"
          />
          {/* Left Data lines */}
          <line
            x1="492"
            y1="293"
            x2="520"
            y2="293"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="492"
            y1="301"
            x2="515"
            y2="301"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="492"
            y1="309"
            x2="522"
            y2="309"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="492"
            y1="317"
            x2="510"
            y2="317"
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Right Chart Box with crossed accent in project emerald */}
          <rect
            x="528"
            y="290"
            width="26"
            height="30"
            rx="3"
            fill="#D1FAE5"
            stroke="#10B981"
            strokeWidth="1.5"
          />
          <line
            x1="528"
            y1="290"
            x2="554"
            y2="320"
            stroke="#10B981"
            strokeWidth="1.5"
          />
          <line
            x1="554"
            y1="290"
            x2="528"
            y2="320"
            stroke="#10B981"
            strokeWidth="1.5"
          />
        </g>
      </svg>
    </div>
  );
};
