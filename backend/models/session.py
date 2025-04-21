from datetime import datetime
from . import db

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(500), nullable=False, unique=True)
    refresh_token = db.Column(db.String(500), nullable=True, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('sessions', lazy=True, cascade='all, delete-orphan'))
    
    def __init__(self, user_id, token, refresh_token=None, expires_at=None):
        self.user_id = user_id
        self.token = token
        self.refresh_token = refresh_token
        self.expires_at = expires_at or datetime.utcnow()
    
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'token': self.token,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
