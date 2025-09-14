import { FC } from 'react';

interface ProgressBarProps {
  /** 当前进度值 */
  value: number;
  /** 最大值 */
  max: number;
  /** 进度条宽度，默认为 w-[20rem] */
  width?: string;
  /** 进度条高度，默认为 h-5 */
  height?: string;
  /** 进度条颜色，默认为绿色 */
  color?: string;
  /** 背景颜色，默认为灰色 */
  backgroundColor?: string;
  /** 是否显示百分比文字 */
  showPercentage?: boolean;
  /** 百分比文字样式 */
  percentageClassName?: string;
  /** 是否启用动画效果 */
  animated?: boolean;
}

const ProgressBar: FC<ProgressBarProps> = ({
  value,
  max,
  width = 'w-[20rem]',
  height = 'h-5',
  color = 'bg-green-400',
  backgroundColor = 'bg-gray-200',
  showPercentage = true,
  percentageClassName = 'text-xs font-normal',
  animated = true,
}) => {
  // 计算百分比
  const percentage = Math.min((value / (max || 1)) * 100, 100);

  return (
    <div className="relative">
      <div
        className={`${width} ${height} overflow-hidden rounded-full max-sm:h-[14px] ${backgroundColor}`}
      >
        <div
          className={`${height} rounded-full ${color} transition-all duration-500 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${percentage}%`,
          }}
        >
          <div className="h-full w-full translate-x-full transform bg-white opacity-20"></div>
        </div>
      </div>
      {showPercentage && (
        <span
          className={`absolute top-full -translate-x-1/2 max-sm:text-[10px] ${percentageClassName}`}
          style={{
            left: `${percentage}%`,
          }}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
