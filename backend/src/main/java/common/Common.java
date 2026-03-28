package common;

import org.modelmapper.ModelMapper;

public class Common {
    public static <T, S> T convertToDto(S source, Class<T> dtoClass, ModelMapper modelMapper) {
        return modelMapper.map(source, dtoClass);
    }
}
