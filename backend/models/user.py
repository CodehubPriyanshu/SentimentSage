from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    profile_photo = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    text_analyses = db.relationship('TextAnalysis', backref='user', lazy=True, cascade='all, delete-orphan')
    csv_analyses = db.relationship('CSVAnalysis', backref='user', lazy=True, cascade='all, delete-orphan')
    twitter_analyses = db.relationship('TwitterAnalysis', backref='user', lazy=True, cascade='all, delete-orphan')
    youtube_analyses = db.relationship('YoutubeAnalysis', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, email, password, full_name):
        self.email = email
        self.set_password(password)
        self.full_name = full_name
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'profile_photo': self.profile_photo,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
