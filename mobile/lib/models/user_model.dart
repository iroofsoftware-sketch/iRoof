class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? token;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? 'Staff User',
      email: json['email'] ?? '',
      role: json['role'] ?? 'sitevisitor',
      token: token ?? json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'token': token,
    };
  }

  String get roleDisplay {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'projectmanager':
        return 'Project Manager';
      case 'sitevisitor':
        return 'Site Inspection & Sales';
      case 'sales':
        return 'Sales & Estimations';
      default:
        return role.toUpperCase();
    }
  }
}
