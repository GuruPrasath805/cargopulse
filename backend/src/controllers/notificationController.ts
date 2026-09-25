import { Request, Response } from 'express';
import { fallbackDb } from '../db/fallbackDb';

export const getNotifications = async (req: Request, res: Response) => {
  return res.json({
    success: true,
    count: fallbackDb.notifications.length,
    unreadCount: fallbackDb.notifications.filter(n => !n.isRead).length,
    data: fallbackDb.notifications,
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = fallbackDb.notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
  }
  return res.json({ success: true, message: 'Notification marked as read' });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  fallbackDb.notifications.forEach(n => (n.isRead = true));
  return res.json({ success: true, message: 'All notifications marked as read' });
};
