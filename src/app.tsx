import { useEffect, useState } from 'react';

const STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

type Bot = {
  id: number;
  name: string;
};

type Order = {
  id: string;
  item: string;
  status: (typeof STATUS)[keyof typeof STATUS];
  isVip: boolean;
  botId?: number;
  countDown?: number;
};

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);

  const addBot = () => {
    setBots([
      ...bots,
      {
        id: Date.now(),
        name: "Bot " + (bots.length + 1),
      },
    ]);
  };

  // Remove the last bot and reassign its in-progress order (if any) back to pending
  const removeBot = () => {
    if (bots.length === 0) return;

    const lastBotId = bots.at(-1)?.id;

    setOrders((prev) =>
      prev.map((o) =>
        o.botId === lastBotId && o.status === STATUS.IN_PROGRESS
          ? {
              ...o,
              status: STATUS.PENDING,
              botId: undefined,
              countDown: undefined,
            }
          : o
      )
    );

    bots.pop();
  };

  const addOrder = (isVip: boolean) => {
    setOrders([
      ...orders,
      {
        id: Math.random().toString(36).slice(2),
        item: "Food " + (orders.length + 1),
        status: STATUS.PENDING,
        isVip,
      },
    ]);
  };

  // Assign orders to available bots, prioritizing VIP orders
  useEffect(() => {
    if (bots.length === 0) return;

    const nextOrder = [...orders]
      .filter((o) => o.status === STATUS.PENDING)
      .sort((a, b) => (a.isVip === b.isVip ? 0 : a.isVip ? -1 : 1))[0];

    if (!nextOrder) return;

    const availableBot = bots.find(
      (b) =>
        !orders.some((o) => o.status === STATUS.IN_PROGRESS && o.botId === b.id)
    );
    if (!availableBot) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === nextOrder.id
          ? {
              ...o,
              status: STATUS.IN_PROGRESS,
              botId: availableBot.id,
              countDown: 10,
            }
          : o
      )
    );
  }, [orders, bots]);

  // Countdown for in-progress orders
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => {
          if (
            o.status === STATUS.IN_PROGRESS &&
            o.countDown &&
            o.countDown > 0
          ) {
            const newCount = o.countDown - 1;
            if (newCount === 0) {
              return { ...o, status: STATUS.COMPLETED, countDown: undefined };
            }
            return { ...o, countDown: newCount };
          }
          return o;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Customer</h2>
      <button onClick={() => addOrder(false)}>New Normal Order</button>
      <button onClick={() => addOrder(true)}>New VIP Order</button>

      <h3>My Orders</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Status</th>
            <th>Countdown</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              style={{ backgroundColor: o.isVip ? "gold" : "transparent" }}
            >
              <td>{o.id}</td>
              <td>{o.item}</td>
              <td>{o.status}</td>
              <td>{o.countDown}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ marginBlock: "40px" }} />
      <h2>Manager</h2>
      <button onClick={addBot}>+ Bot</button>
      <button onClick={removeBot}>- Bot</button>

      <h3>Bot List</h3>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {bots.map((bot) => (
            <tr key={bot.id}>
              <td>{bot.id}</td>
              <td>{bot.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Pending order List</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Status</th>
            <th>Handling by</th>
          </tr>
        </thead>
        <tbody>
          {[...orders]
            .filter(
              (o) =>
                o.status === STATUS.PENDING || o.status === STATUS.IN_PROGRESS
            )
            .sort((a, b) => (a.isVip === b.isVip ? 0 : a.isVip ? -1 : 1))
            .map((o) => (
              <tr
                key={o.id}
                style={{
                  backgroundColor: o.isVip ? "gold" : "transparent",
                }}
              >
                <td>{o.id}</td>
                <td>{o.item}</td>
                <td>{o.status}</td>
                <td>{bots.find((b) => b.id === o.botId)?.name}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <h3>Completed order List</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[...orders]
            .filter((o) => o.status === STATUS.COMPLETED)
            .map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.item}</td>
                <td>{o.status}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
