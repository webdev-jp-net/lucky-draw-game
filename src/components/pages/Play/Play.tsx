/* eslint @typescript-eslint/ban-ts-comment: 0 */
import { FC, useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { Button } from 'components/parts/Button';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from 'firebaseDB';
import { RootState } from 'store';
import { updateScore } from 'store/user';

import styles from './Play.module.scss';

export const Play: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { score } = useSelector((state: RootState) => state.user);

  const [drawResult, setDrawResult] = useState<string>('');
  const [roomEntries, setRoomEntries] = useState<string[]>([]);

  // getDoc関数を非同期関数で呼び出す
  const fetchDocData = async () => {
    const drawResultDocRef = doc(db, 'status', 'draw_result');
    const drawResultDocSnap = await getDoc(drawResultDocRef);

    if (drawResultDocSnap.exists()) {
      setDrawResult(drawResultDocSnap.data().userId);
    } else {
      setDrawResult('No such document!');
    }

    const roomEntriesDocRef = doc(db, 'status', 'room_entries');
    const roomEntriesDocSnap = await getDoc(roomEntriesDocRef);

    if (roomEntriesDocSnap.exists()) {
      console.log(roomEntriesDocSnap.data());
      setRoomEntries(roomEntriesDocSnap.data().memberList);
    } else {
      setRoomEntries([]);
    }

    const statusRef = collection(db, 'status');
    await setDoc(doc(statusRef, 'draw_result'), {
      userId: 'hoge',
    });

    await setDoc(doc(statusRef, 'room_entries'), {
      memberList: ['hoge'],
    });
  };

  // データ取得
  useEffect(() => {
    fetchDocData();
  }, []);

  return (
    <div className={`l-page ${styles.play}`}>
      <p>当選者: {drawResult}</p>
      <p>参加者: {roomEntries.join('/')}</p>
      <Button
        handleClick={() => {
          navigate('/');
        }}
      >
        exit
      </Button>
    </div>
  );
};
