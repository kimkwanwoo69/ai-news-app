"use client";

import { createContext, useContext, useState } from "react";

type FetchingState = {
  fetching: boolean;
  setFetching: (value: boolean) => void;
};

const FetchingContext = createContext<FetchingState>({
  fetching: false,
  setFetching: () => {},
});

// 헤더의 '뉴스 가져오기' 버튼과 본문의 뉴스 보드가 진행 상태를 공유한다.
export function FetchingProvider({ children }: { children: React.ReactNode }) {
  const [fetching, setFetching] = useState(false);
  return (
    <FetchingContext.Provider value={{ fetching, setFetching }}>
      {children}
    </FetchingContext.Provider>
  );
}

export function useFetching() {
  return useContext(FetchingContext);
}
