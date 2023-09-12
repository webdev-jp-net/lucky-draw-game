import { FC, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { Button } from 'components/parts/Button';
import { RootState } from 'store';
import {
  useGetEntriesQuery,
  useGetDrawResultQuery,
  useUpdateEntriesMutation,
  useUpdateDrawResultMutation,
} from 'store/user';

import styles from './Play.module.scss';

export const Play: FC = () => {
  const navigate = useNavigate();
  const { userId, memberList, drawResult } = useSelector((state: RootState) => state.user);

  // 入室メンバー取得
  const {
    isSuccess: getEntriesSuccess,
    isError: getEntriesError,
    refetch: getEntriesRefetch,
  } = useGetEntriesQuery();

  // 抽選結果取得
  const {
    isSuccess: getDrawResultSuccess,
    isError: getDrawResultError,
    refetch: getDrawResultRefetch,
  } = useGetDrawResultQuery();

  // 成功: 入室メンバー取得
  useEffect(() => {
    if (getEntriesSuccess) console.log({ getEntriesSuccess });
  }, [getEntriesSuccess]);

  // 成功: 抽選結果取得
  useEffect(() => {
    if (getDrawResultSuccess) console.log({ getDrawResultSuccess });
  }, [getDrawResultSuccess]);

  // エラー: 入室メンバー取得
  useEffect(() => {
    if (getEntriesError) console.error({ getEntriesError });
  }, [getEntriesError]);

  // エラー: 抽選結果取得
  useEffect(() => {
    if (getDrawResultError) console.error({ getDrawResultError });
  }, [getDrawResultError]);

  //入室メンバー情報と抽選結果を取得できているか確認するフラグ
  const initialLoaded = useMemo(() => {
    return getEntriesSuccess && getDrawResultSuccess;
  }, [getEntriesSuccess, getDrawResultSuccess]);

  // 配列の要素からランダムに一つ引き当てる
  const getRandomElement = (list: string[]) => {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  };

  // 入室メンバーを更新する
  const [
    sendEntries, // mutation trigger
    { isLoading: entriesLoading, isSuccess: entriesSuccess, isError: entriesError }, // mutation state
  ] = useUpdateEntriesMutation();

  // 抽選結果を更新する
  const [
    sendDrawResult, // mutation trigger
    { isLoading: drawResultLoading, isSuccess: drawResultSuccess, isError: drawResultError }, // mutation state
  ] = useUpdateDrawResultMutation();

  // 抽選結果を更新成功したらrefetchする
  useEffect(() => {
    if (drawResultSuccess) getDrawResultRefetch();
  }, [drawResultSuccess, getDrawResultRefetch]);

  // 抽選を実行する
  const handleDraw = () => {
    const result = getRandomElement(memberList);
    console.log({ result });
    sendDrawResult(result);
  };

  // userIdがあるならば、入室メンバーを更新する
  useEffect(() => {
    if (userId) {
      const newMemberList = [...memberList, userId];
      // 重複を解消する
      const uniqueMemberList: string[] = Array.from(new Set<string>(newMemberList));
      sendEntries(uniqueMemberList);
    }
  }, [userId, sendEntries, memberList]);

  return (
    <div className={`l-page ${styles.play}`}>
      <div className={styles.container}>
        <p>load: {initialLoaded ? 'ok' : 'ng'}</p>
        <p>winner: {drawResult}</p>
        <p>myself: {userId}</p>

        <div className={styles.memberList}>
          {memberList.map((value, index) => (
            <div key={index} className={styles.member}>
              <span className={styles.memberIcon} style={{ color: `#${value}` }}></span>
              {value === userId && <span className={styles.current}>myself</span>}
            </div>
          ))}
        </div>
        <div className={styles.menu}>
          <Button handleClick={getEntriesRefetch} disabled={entriesLoading}>
            reload
          </Button>
          <Button handleClick={handleDraw} disabled={drawResultLoading}>
            drew
          </Button>
          <Button
            handleClick={() => {
              navigate('/');
            }}
          >
            exit
          </Button>
        </div>
      </div>
    </div>
  );
};
