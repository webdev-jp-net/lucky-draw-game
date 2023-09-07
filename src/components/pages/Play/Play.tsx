/* eslint @typescript-eslint/ban-ts-comment: 0 */
import { FC, useState, useEffect, useCallback, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { Button } from 'components/parts/Button';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from 'firebaseDB';
import { RootState } from 'store';
import { updateUserId } from 'store/user';

import { useGenerateAndStoreSessionId } from 'hooks/useGenerateAndStoreSessionId';

import styles from './Play.module.scss';

export const Play: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useSelector((state: RootState) => state.user);

  const generateId = useGenerateAndStoreSessionId;

  const [step, setStep] = useState<number>(0);

  // 抽選結果
  const [drawResult, setDrawResult] = useState<string>('');
  const [drawResultSuccess, setDrawResultSuccess] = useState<boolean>(false);

  // 入室中メンバー
  const [roomEntries, setRoomEntries] = useState<string[]>([]);
  const [roomEntriesSuccess, setRoomEntriesSuccess] = useState<boolean>(false);

  // 抽選結果データを非同期関数で呼び出す
  const fetchResultDocData = async () => {
    const drawResultDocRef = doc(db, 'status', 'draw_result');
    const drawResultDocSnap = await getDoc(drawResultDocRef);
    if (drawResultDocSnap.exists()) {
      setDrawResult(drawResultDocSnap.data().userId);
      setDrawResultSuccess(true);
    } else {
      setDrawResult('No such document!');
      setDrawResultSuccess(false);
    }
  };

  // エントリー中メンバーのデータを非同期関数で呼び出す
  const fetchRoomEntriesDocData = async () => {
    const roomEntriesDocRef = doc(db, 'status', 'room_entries');
    const roomEntriesDocSnap = await getDoc(roomEntriesDocRef);

    if (roomEntriesDocSnap.exists()) {
      setRoomEntries(roomEntriesDocSnap.data().memberList);
      setRoomEntriesSuccess(true);
    } else {
      setRoomEntries([]);
      setRoomEntriesSuccess(false);
    }
  };

  // 書き込みのためのstatusコレクションRef
  const statusRef = collection(db, 'status');

  // 抽選結果をリセット
  const resetDrawResultData = async () => {
    const statusRef = collection(db, 'status');
    await setDoc(doc(statusRef, 'draw_result'), {
      userId: '',
    });
  };

  // 自分のIDをエントリー
  const addMyEntry = useCallback(async () => {
    if (userId !== '' && roomEntries !== null) {
      const result = [...roomEntries, userId];
      await setDoc(doc(statusRef, 'room_entries'), {
        memberList: result,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomEntries, userId]);

  // 抽選結果を保存
  const addDrawResult = async (newResult: string) => {
    const statusRef = collection(db, 'status');
    console.log({ newResult });
    await setDoc(doc(statusRef, 'draw_result'), {
      userId: newResult,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  // 抽選結果が残っているが、誰も入室していない
  useEffect(() => {
    // 抽選結果が残っているが、誰も入室していない
    if (step === 1 && roomEntries.length > 0 && drawResult !== '') {
      // 抽選結果をリセット
      resetDrawResultData();
      setDrawResult('');
    }
  }, [drawResult, roomEntries, userId, step]);

  // DBから入室メンバー情報と抽選結果を取得できているか確認するフラグ
  const initialLoaded = useMemo(() => {
    const result = drawResultSuccess && roomEntriesSuccess;
    setStep(1);
    return result;
  }, [drawResultSuccess, roomEntriesSuccess]);

  // 既に自分が入室済みかどうか管理するフラグ
  const isMyEntry = useMemo(() => {
    return roomEntries !== null && roomEntries.includes(userId);
  }, [roomEntries, userId]);

  // 自分のエントリーがまだの場合はエントリーする
  useEffect(() => {
    if (step === 2) {
      if (userId === '') {
        const newId = generateId();
        dispatch(updateUserId(newId));
      }
      if (!isMyEntry) addMyEntry();
      setStep(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoaded, step]);

  // 誰も入室していないが抽選結果が残っている場合はリセットする
  useEffect(() => {
    if (step === 1 && !roomEntries.length && roomEntries) {
      resetDrawResultData();
    }
    setStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoaded, step]);

  // データ取得
  useEffect(() => {
    fetchResultDocData();
    fetchRoomEntriesDocData();
  }, []);

  // 配列の要素からランダムに一つ引き当てる
  const getRandomElement = (list: string[]) => {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  };
  // 抽選を実行する
  const handleDraw = () => {
    const result = getRandomElement(roomEntries);
    setDrawResult(result);
    addDrawResult(result);
  };

  return (
    <div className={`l-page ${styles.play}`}>
      <div className={styles.container}>
        <p>load: {initialLoaded ? 'ok' : 'ng'}</p>
        <p>winner: {drawResult}</p>
        <p>myself: {userId}</p>

        <div className={styles.memberList}>
          {roomEntries !== null &&
            roomEntries.map((value, index) => (
              <div key={index} className={styles.member}>
                <span className={styles.memberIcon} style={{ color: `#${value}` }}></span>
                {value === userId && <span className={styles.current}>myself</span>}
              </div>
            ))}
        </div>
        <div className={styles.menu}>
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
