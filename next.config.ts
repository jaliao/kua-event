import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 部署採 standalone 輸出（Docker 多階段建置）
  output: "standalone",
};

export default nextConfig;
