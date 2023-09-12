import { FC, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { Button } from 'components/parts/Button';
import { RootState } from 'store';
import { useGetEntriesQuery, useGetDrawResultQuery } from 'store/user';

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
  const { isSuccess: getDrawResultSuccess, isError: getDrawResultError } = useGetDrawResultQuery();

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

  // 抽選を実行する
  const handleDraw = () => {
    const result = getRandomElement(memberList);
    console.log({ result });
  };

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
          <Button handleClick={getEntriesRefetch}>reload</Button>
          <Button handleClick={handleDraw}>drew</Button>
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
