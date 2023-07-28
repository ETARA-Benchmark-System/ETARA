package Utils;

public enum ErrorType {
	JsonWithoutStatus,
	JsonWithStatus,
	Server;
	
	public static ErrorType fromString(String type) {
		if (type == null) {
			return ErrorType.Server; //default
		}
		
		switch (type) {
			case "jsonWithStatus":
				return ErrorType.JsonWithStatus;
			case "jsonWithoutStatus":
				return ErrorType.JsonWithoutStatus;
			case "server":
				return ErrorType.Server;
			default:
				throw new IllegalArgumentException("Invalid value for errorType");
		}
	}
}
